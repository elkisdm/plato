#!/usr/bin/env python3
"""Imagen por fal.ai: FLUX 1.1 Pro (texto→imagen) o FLUX Kontext Pro (referencia→imagen,
consistencia de personaje). Registra prompt/seed/costo en un JSON espejo.

Uso:
  fal_imagen.py "<prompt>" <salida.png> [--ref referencia.png] [--ar 16:9] [--seed N] [--tope 150]

Precios fal.ai 2026-09-17: Kontext Pro 0.04 USD/imagen; FLUX 1.1 Pro ≈ 0.04 USD/imagen.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal_cliente import Fal  # noqa: E402

TXT2IMG = "fal-ai/flux-pro/v1.1"
KONTEXT = "fal-ai/flux-pro/kontext"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("salida", type=Path)
    ap.add_argument("--ref", type=Path, default=None, help="imagen de referencia (Kontext)")
    ap.add_argument("--ar", default="16:9")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--tope", type=float, default=150)
    args = ap.parse_args()
    seed = args.seed if args.seed is not None else random.randint(1, 2**31 - 1)
    fal = Fal(tope_usd=args.tope)
    if args.ref:
        modelo = KONTEXT
        entrada = {"prompt": args.prompt, "image_url": fal.data_uri(args.ref), "aspect_ratio": args.ar, "seed": seed, "output_format": "png", "safety_tolerance": "4"}
    else:
        modelo = TXT2IMG
        entrada = {"prompt": args.prompt, "aspect_ratio": args.ar, "seed": seed, "output_format": "png", "safety_tolerance": "4"}
    res = fal.correr(modelo, entrada, costo_estimado=0.04, meta={"salida": str(args.salida)})
    imgs = res.get("images") or []
    if not imgs:
        raise SystemExit(f"respuesta sin imagen: {json.dumps(res)[:400]}")
    fal.descargar(imgs[0]["url"], args.salida)
    args.salida.with_suffix(".json").write_text(json.dumps({
        "modelo": modelo, "prompt": args.prompt, "seed": res.get("seed", seed), "ref": str(args.ref) if args.ref else None,
        "aspect_ratio": args.ar, "costo_usd": 0.04, "generado_en": datetime.now(timezone.utc).isoformat(),
    }, ensure_ascii=False, indent=2))
    print(f"ok {args.salida} · gastado {fal.gastado():.2f} USD")
    return 0


if __name__ == "__main__":
    sys.exit(main())
