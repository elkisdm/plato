#!/usr/bin/env python3
"""Cliente mínimo de la cola de fal.ai (REST, sin SDK) para el pipeline del productor.

Credencial: FAL_KEY en el entorno o en ~/.config/plato/fal.env (línea FAL_KEY=...).
Gasto: cada llamada se registra en <registro>/gasto.jsonl con modelo, unidades y costo
estimado; `tope_usd` corta antes de encolar si el acumulado lo superaría.

Uso como módulo:
  from fal_cliente import Fal
  fal = Fal(tope_usd=150)
  out = fal.correr("fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
                   {"image_url": fal.data_uri("E01.png"), "prompt": "...", "duration": "5"},
                   costo_estimado=0.35)
"""
from __future__ import annotations

import base64
import json
import mimetypes
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

COLA = "https://queue.fal.run"


def leer_clave() -> str:
    clave = os.environ.get("FAL_KEY")
    if clave:
        return clave
    env = Path.home() / ".config/plato/fal.env"
    if env.exists():
        for linea in env.read_text().splitlines():
            if linea.startswith("FAL_KEY="):
                return linea.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("Falta FAL_KEY (entorno o ~/.config/plato/fal.env)")


class Fal:
    def __init__(self, tope_usd: float, registro: Path = Path("material/produccion/ejemplo/fal")):
        self.clave = leer_clave()
        self.tope = tope_usd
        self.registro = registro
        self.registro.mkdir(parents=True, exist_ok=True)
        self.gasto_path = self.registro / "gasto.jsonl"

    # ---- gasto ----
    def gastado(self) -> float:
        if not self.gasto_path.exists():
            return 0.0
        return sum(json.loads(l)["costo_usd"] for l in self.gasto_path.read_text().splitlines() if l.strip())

    def _registrar(self, modelo: str, costo: float, meta: dict) -> None:
        with self.gasto_path.open("a") as f:
            f.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(), "modelo": modelo, "costo_usd": round(costo, 4), **meta}, ensure_ascii=False) + "\n")

    # ---- http ----
    def _req(self, url: str, payload: dict | None = None) -> dict:
        data = json.dumps(payload).encode() if payload is not None else None
        req = urllib.request.Request(url, data=data, headers={"Authorization": f"Key {self.clave}", "Content-Type": "application/json"}, method="POST" if data else "GET")
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"fal {e.code} en {url}: {e.read().decode()[:400]}") from e

    @staticmethod
    def data_uri(ruta: str | Path) -> str:
        p = Path(ruta)
        mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"

    def correr(self, modelo: str, entrada: dict, costo_estimado: float, timeout_s: int = 900, meta: dict | None = None) -> dict:
        """Encola, espera y devuelve el resultado. Corta si el gasto superaría el tope."""
        if self.gastado() + costo_estimado > self.tope:
            raise SystemExit(f"Tope de gasto {self.tope} USD alcanzado (gastado {self.gastado():.2f} + {costo_estimado:.2f})")
        sub = self._req(f"{COLA}/{modelo}", entrada)
        rid = sub["request_id"]
        status_url = sub.get("status_url") or f"{COLA}/{modelo}/requests/{rid}/status"
        result_url = sub.get("response_url") or f"{COLA}/{modelo}/requests/{rid}"
        t0 = time.time()
        while True:
            st = self._req(status_url)
            if st.get("status") == "COMPLETED":
                break
            if st.get("status") in ("FAILED", "CANCELLED"):
                raise RuntimeError(f"fal {st.get('status')}: {st}")
            if time.time() - t0 > timeout_s:
                raise TimeoutError(f"fal timeout {modelo} {rid}")
            time.sleep(4)
        res = self._req(result_url)
        self._registrar(modelo, costo_estimado, {"request_id": rid, "segundos": round(time.time() - t0, 1), **(meta or {})})
        return res

    @staticmethod
    def descargar(url: str, destino: Path) -> Path:
        destino.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url, timeout=300) as r, destino.open("wb") as f:
            f.write(r.read())
        return destino
