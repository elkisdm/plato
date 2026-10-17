#!/usr/bin/env python3
"""Fábrica de tomas de VO con F5-TTS (checkpoint español jpgallegoar/F5-Spanish) a partir de un
guion.md. Misma salida que vo_tomas.py (E??_t?.wav + manifest.json) para que vo_qc.py y
vo_assemble.py sigan funcionando sin cambios.

Uso (venv con f5-tts; en la M5 Pro MPS revienta, así que CPU):
  F5_DEVICE=cpu DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/opt/ffmpeg@7/lib \
    ~/Developer/personal/voz/.venv-f5/bin/python vo_tomas_f5.py <guion.md> <salida/> \
    --ref <ref.wav> --ref-text "<transcripción exacta>" [--tomas 1] [--solo E01,E02]

- Referencia corta (≤ 15 s) con su transcripción exacta: F5 la necesita para alinear.
- La velocidad sale del perfil de escena (revelación y cierre más lentas, hook algo más ágil).
- Reanudable: salta las tomas que ya existen.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vo_tomas import SEEDS, cargar_escenas, perfil_de_escena  # noqa: E402

VELOCIDAD = {
    "base": 0.94,
    "hook": 0.97,
    "revelacion": 0.90,
    "aforismo": 0.90,
    "objecion": 0.95,
    "matiz": 0.93,
    "cierre": 0.90,
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion", type=Path)
    ap.add_argument("salida", type=Path)
    ap.add_argument("--ref", type=Path, required=True)
    ap.add_argument("--ref-text", required=True)
    ap.add_argument("--tomas", type=int, default=1)
    ap.add_argument("--solo", default="")
    ap.add_argument("--overrides", type=Path, default=None, help="json {id: perfil}")
    args = ap.parse_args()

    escenas = cargar_escenas(args.guion)
    if args.solo:
        ids = set(args.solo.split(","))
        escenas = [e for e in escenas if e.id in ids]
    overrides = json.loads(args.overrides.read_text()) if args.overrides else {}
    args.salida.mkdir(parents=True, exist_ok=True)
    manifest_path = args.salida / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

    import soundfile as sf
    import torch
    from f5_tts.api import F5TTS
    from huggingface_hub import snapshot_download

    repo = Path(snapshot_download("jpgallegoar/F5-Spanish"))
    ckpt = sorted(list(repo.rglob("*.safetensors")) + list(repo.rglob("*.pt")))[-1]
    vocab = next(repo.rglob("vocab.txt"), None)
    device = os.environ.get("F5_DEVICE") or ("mps" if torch.backends.mps.is_available() else "cpu")
    tts = F5TTS(model="F5TTS_Base", ckpt_file=str(ckpt), vocab_file=str(vocab) if vocab else "", device=device)

    for i in range(1, args.tomas + 1):
        seed = SEEDS[(i - 1) % len(SEEDS)]
        for e in escenas:
            perfil = perfil_de_escena(e.nombre, e.tipo, overrides, e.id)
            velocidad = VELOCIDAD[perfil]
            entry = manifest.setdefault(e.id, {"texto": e.vo, "perfil": perfil, "nombre": e.nombre, "tomas": []})
            fn = f"{e.id}_t{i}.wav"
            if (args.salida / fn).exists() and any(t["file"] == fn for t in entry["tomas"]):
                continue
            t0 = time.time()
            wav, sr, _ = tts.infer(ref_file=str(args.ref), ref_text=args.ref_text, gen_text=e.vo,
                                   speed=velocidad, seed=seed, remove_silence=False)
            sf.write(str(args.salida / fn), wav, sr)
            dur = len(wav) / sr
            entry["tomas"] = [t for t in entry["tomas"] if t["file"] != fn]
            entry["tomas"].append({"file": fn, "seed": seed, "dur": round(dur, 2),
                                   "params": {"modelo": "f5-spanish", "speed": velocidad}})
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
            print(f"ok {fn} {perfil} {dur:.2f}s gen={time.time() - t0:.0f}s", flush=True)
    print("FABRICA F5 COMPLETA", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
