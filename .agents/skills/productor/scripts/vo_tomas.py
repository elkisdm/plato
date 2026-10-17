#!/usr/bin/env python3
"""Fábrica de tomas de VO con Chatterbox a partir de un guion.md de la skill guionista.

Uso (con el venv de Chatterbox):
  ~/Developer/personal/voz/.venv-cbox/bin/python vo_tomas.py <guion.md> <salida/> [--tomas 4] [--solo E01,E02]

- Un perfil de prosodia por escena (perfil_de_escena), nunca por frase.
- Reanudable: salta las tomas que ya existen. El bucle exterior es por toma, así una
  corrida interrumpida deja al menos una pasada completa de todas las escenas.
- Escribe <salida>/manifest.json con texto, perfil, seed y duración por toma.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PERFILES = {
    "base": (0.42, 0.55, 0.60),
    "hook": (0.50, 0.50, 0.70),
    "revelacion": (0.60, 0.45, 0.70),
    "aforismo": (0.35, 0.60, 0.50),
    "objecion": (0.46, 0.55, 0.65),
    "matiz": (0.38, 0.58, 0.55),
    "cierre": (0.45, 0.50, 0.65),
}
SEEDS = [20260917, 7, 1850, 2040]
PAUSA_S = 0.28
MIN_CHARS = 60


def perfil_de_escena(nombre: str, tipo: str, overrides: dict[str, str] | None = None, id_: str = "") -> str:
    """Perfil por nombre de escena (director-cine §1.1). Los overrides por id ganan."""
    if overrides and id_ in overrides:
        return overrides[id_]
    n = nombre.lower()
    if "cierre" in n:
        return "cierre"
    if "doctrina" in n or "tres verbos" in n:
        return "aforismo"
    if "objeci" in n:
        return "objecion"
    if "matiz" in n or "no inventamos" in n or "cuánto tarda" in n:
        return "matiz"
    if "revelaci" in n:
        return "revelacion"
    if "cold open" in n or "re-hook" in n or "breadcrumb" in n or "promesa" in n:
        return "hook"
    return "base"


def frases(texto: str, min_chars: int = MIN_CHARS) -> list[str]:
    """Parte por puntuación fuerte y reagrupa hasta >= min_chars: Chatterbox alucina con
    fragmentos cortos y trunca párrafos largos."""
    partes, buffer = [], ""
    for f in re.split(r"(?<=[.;:?!…])\s+", texto.strip()):
        f = f.strip()
        if not f:
            continue
        buffer = f"{buffer} {f}".strip() if buffer else f
        if len(buffer) >= min_chars:
            partes.append(buffer)
            buffer = ""
    if buffer:
        if partes and len(buffer) < 25:
            partes[-1] = f"{partes[-1]} {buffer}"
        else:
            partes.append(buffer)
    return partes


def cargar_escenas(guion: Path):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "guionista" / "scripts"))
    import presupuesto_vo  # type: ignore

    _, escenas = presupuesto_vo.parsear(guion.read_text(encoding="utf-8"))
    return [e for e in escenas if e.vo]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion", type=Path)
    ap.add_argument("salida", type=Path)
    ap.add_argument("--tomas", type=int, default=4)
    ap.add_argument("--solo", default="", help="ids separados por coma")
    ap.add_argument("--overrides", type=Path, default=None, help="json {id: perfil}")
    ap.add_argument("--ref", type=Path, default=Path.home() / "Developer/personal/voz/referencia.wav")
    args = ap.parse_args()

    escenas = cargar_escenas(args.guion)
    if args.solo:
        ids = set(args.solo.split(","))
        escenas = [e for e in escenas if e.id in ids]
    overrides = json.loads(args.overrides.read_text()) if args.overrides else {}
    args.salida.mkdir(parents=True, exist_ok=True)
    manifest_path = args.salida / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

    import torch
    import torchaudio
    import perth

    if getattr(perth, "PerthImplicitWatermarker", None) is None:
        perth.PerthImplicitWatermarker = perth.DummyWatermarker
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    pausa = torch.zeros(1, int(PAUSA_S * model.sr))

    import time

    for i in range(1, args.tomas + 1):
        seed = SEEDS[(i - 1) % len(SEEDS)]
        for e in escenas:
            perfil = perfil_de_escena(e.nombre, e.tipo, overrides, e.id)
            ex, cfg, temp = PERFILES[perfil]
            entry = manifest.setdefault(e.id, {"texto": e.vo, "perfil": perfil, "nombre": e.nombre, "tomas": []})
            fn = f"{e.id}_t{i}.wav"
            if (args.salida / fn).exists() and any(t["file"] == fn for t in entry["tomas"]):
                continue
            t0 = time.time()
            trozos = []
            for parte in frases(e.vo):
                torch.manual_seed(seed)
                wav = model.generate(parte, language_id="es", audio_prompt_path=str(args.ref),
                                     exaggeration=ex, cfg_weight=cfg, temperature=temp)
                trozos.append(wav.cpu())
                trozos.append(pausa)
            completo = torch.cat(trozos[:-1], dim=-1)
            torchaudio.save(str(args.salida / fn), completo, model.sr)
            dur = completo.shape[-1] / model.sr
            entry["tomas"] = [t for t in entry["tomas"] if t["file"] != fn]
            entry["tomas"].append({"file": fn, "seed": seed, "dur": round(dur, 2),
                                   "params": {"exaggeration": ex, "cfg_weight": cfg, "temperature": temp}})
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
            print(f"ok {fn} {perfil} {dur:.2f}s gen={time.time() - t0:.0f}s", flush=True)
    print("FABRICA DE TOMAS COMPLETA", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
