#!/usr/bin/env python3
"""Imagen → clip por fal.ai, con registro de prompt/modelo/costo junto al mp4.

Uso:
  fal_clip.py <keyframe.png> "<prompt de movimiento>" <salida.mp4> [--modelo kling25|kling3|wan25] [--dur 5] [--tope 150]

Modelos (precios fal.ai 2026-09-17, clip de 5 s):
  kling25 = fal-ai/kling-video/v2.5-turbo/pro/image-to-video  0.07 USD/s (1080p)
  kling3  = fal-ai/kling-video/v3/turbo/pro/image-to-video    0.14 USD/s (1080p, máx 5 s)
  wan25   = fal-ai/wan-25-preview/image-to-video              0.10 USD/s (720p)
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fal_cliente import Fal  # noqa: E402

MODELOS = {
    "kling25": ("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", 0.07, lambda img, p, d: {"image_url": img, "prompt": p, "duration": str(d), "negative_prompt": "blur, distort, low quality, text, watermark", "cfg_scale": 0.5}),
    "kling3": ("fal-ai/kling-video/v3/turbo/pro/image-to-video", 0.14, lambda img, p, d: {"image_url": img, "prompt": p, "duration": str(min(d, 5))}),
    "wan25": ("fal-ai/wan-25-preview/image-to-video", 0.10, lambda img, p, d: {"image_url": img, "prompt": p, "resolution": "720p", "duration": str(d)}),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("keyframe", type=Path)
    ap.add_argument("prompt")
    ap.add_argument("salida", type=Path)
    ap.add_argument("--modelo", default="kling25", choices=MODELOS)
    ap.add_argument("--dur", type=int, default=5)
    ap.add_argument("--tope", type=float, default=150)
    args = ap.parse_args()
    endpoint, usd_s, armar = MODELOS[args.modelo]
    fal = Fal(tope_usd=args.tope)
    entrada = armar(fal.data_uri(args.keyframe), args.prompt, args.dur)
    costo = usd_s * min(args.dur, 5 if args.modelo == "kling3" else args.dur)
    res = fal.correr(endpoint, entrada, costo_estimado=costo, meta={"keyframe": args.keyframe.name, "salida": str(args.salida)})
    url = (res.get("video") or {}).get("url")
    if not url:
        raise SystemExit(f"respuesta sin video: {json.dumps(res)[:400]}")
    fal.descargar(url, args.salida)
    args.salida.with_suffix(".json").write_text(json.dumps({
        "keyframe": str(args.keyframe), "modelo": endpoint, "prompt": args.prompt, "duracion": args.dur,
        "costo_usd": round(costo, 3), "generado_en": datetime.now(timezone.utc).isoformat(), "fal": {k: v for k, v in res.items() if k != "video"},
    }, ensure_ascii=False, indent=2))
    print(f"ok {args.salida} ({args.modelo}, {costo:.2f} USD) · gastado {fal.gastado():.2f} USD")
    return 0


if __name__ == "__main__":
    sys.exit(main())
