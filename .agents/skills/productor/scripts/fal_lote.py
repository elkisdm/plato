#!/usr/bin/env python3
"""Lote de clips imagen→video por fal.ai desde clips.json.

Uso: fal_lote.py <clips.json> <keyframes_dir/> <salida/> [--only E01,E03] [--tope 25] [--paralelo 4]

clips.json: {"modelo": "kling25", "dur": 5, "sufijo": "...", "items": [{"escena", "keyframe", "prompt"}]}
El keyframe se busca como <keyframes_dir>/<keyframe>.png (o <keyframe>_k0?_*.png).
Reanudable: salta escenas con mp4 existente. Respeta el tope de gasto de fal_cliente.
"""
from __future__ import annotations

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal_clip import MODELOS  # noqa: E402
from fal_cliente import Fal  # noqa: E402


def buscar_keyframe(dir_: Path, nombre: str) -> Path:
    for cand in [dir_ / f"{nombre}.png", *sorted(dir_.glob(f"{nombre}_k02_*.png")), *sorted(dir_.glob(f"{nombre}_k01_*.png"))]:
        if cand.exists():
            return cand
    raise FileNotFoundError(f"keyframe {nombre} no está en {dir_}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("clips", type=Path)
    ap.add_argument("keyframes", type=Path)
    ap.add_argument("salida", type=Path)
    ap.add_argument("--only", default="")
    ap.add_argument("--tope", type=float, default=25)
    ap.add_argument("--paralelo", type=int, default=4)
    ap.add_argument("--modelo", default=None)
    args = ap.parse_args()
    m = json.loads(args.clips.read_text())
    modelo = args.modelo or m["modelo"]
    endpoint, usd_s, armar = MODELOS[modelo]
    dur = m.get("dur", 5)
    costo = usd_s * min(dur, 5 if modelo == "kling3" else dur)
    args.salida.mkdir(parents=True, exist_ok=True)
    fal = Fal(tope_usd=args.tope)
    items = m["items"]
    if args.only:
        ids = set(args.only.split(","))
        items = [i for i in items if i["escena"] in ids]
    pendientes = [i for i in items if not (args.salida / f"{i['escena']}_{modelo}.mp4").exists()]
    print(f"{len(pendientes)} clips · {costo:.2f} USD c/u · estimado {len(pendientes) * costo:.2f} USD · gastado {fal.gastado():.2f} · tope {args.tope}", flush=True)

    def uno(it: dict) -> str:
        kf = buscar_keyframe(args.keyframes, it["keyframe"])
        prompt = f"{it['prompt']}, {m.get('sufijo', '')}".strip(", ")
        salida = args.salida / f"{it['escena']}_{modelo}.mp4"
        res = fal.correr(endpoint, armar(fal.data_uri(kf), prompt, dur), costo_estimado=costo, meta={"escena": it["escena"], "keyframe": kf.name})
        url = (res.get("video") or {}).get("url")
        if not url:
            raise RuntimeError(f"{it['escena']}: sin video en respuesta")
        fal.descargar(url, salida)
        salida.with_suffix(".json").write_text(json.dumps({"escena": it["escena"], "keyframe": str(kf), "modelo": endpoint, "prompt": prompt, "duracion": dur, "costo_usd": round(costo, 3), "generado_en": datetime.now(timezone.utc).isoformat()}, ensure_ascii=False, indent=2))
        return f"ok {it['escena']} → {salida.name}"

    with ThreadPoolExecutor(max_workers=args.paralelo) as ex:
        futs = {ex.submit(uno, it): it["escena"] for it in pendientes}
        for f in as_completed(futs):
            try:
                print(f.result(), flush=True)
            except SystemExit as e:
                print(f"STOP {futs[f]}: {e}", flush=True)
                break
            except Exception as e:  # noqa: BLE001
                print(f"ERROR {futs[f]}: {e}", flush=True)
    print(f"gastado total {fal.gastado():.2f} USD", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
