#!/usr/bin/env python3
"""Ingiere keyframes generados fuera del pipeline (ChatGPT en el navegador) desde ~/Downloads.

Busca archivos `B01.png`, `B01 (1).png`, `B01.jpg`… (el id al inicio del nombre), mueve el más
reciente de cada id a <keyframes_dir>/<ID>_k0N_sgpt.<ext> con JSON espejo y qc pendiente.
Los duplicados anteriores se guardan como tomas k0(N-1). Convierte a PNG si hace falta (sips).

Uso: ingerir_descargas.py <keyframes_dir> [--downloads ~/Downloads] [--dry]
"""
from __future__ import annotations

import argparse
import datetime
import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

PATRON = re.compile(r"^([BE]\d{2})(?:\s*\(\d+\))?\.(png|jpe?g|webp)$", re.IGNORECASE)


def dimensiones(p: Path) -> tuple[int, int]:
    out = subprocess.check_output(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(p)]).decode()
    w = int(re.search(r"pixelWidth: (\d+)", out).group(1))
    h = int(re.search(r"pixelHeight: (\d+)", out).group(1))
    return w, h


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("keyframes", type=Path)
    ap.add_argument("--downloads", type=Path, default=Path.home() / "Downloads")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()
    args.keyframes.mkdir(parents=True, exist_ok=True)
    por_id: dict[str, list[Path]] = defaultdict(list)
    for p in args.downloads.iterdir():
        m = PATRON.match(p.name)
        if m:
            por_id[m.group(1).upper()].append(p)
    if not por_id:
        print("nada que ingerir")
        return 0
    for id_, archivos in sorted(por_id.items()):
        archivos.sort(key=lambda p: p.stat().st_mtime)
        existentes = len(list(args.keyframes.glob(f"{id_}_k0*_sgpt.png")))
        for i, src in enumerate(archivos):
            n = existentes + i + 1
            dst = args.keyframes / f"{id_}_k0{n}_sgpt.png"
            if args.dry:
                print(f"{src.name} → {dst.name}")
                continue
            if src.suffix.lower() == ".png":
                shutil.move(str(src), dst)
            else:
                subprocess.run(["sips", "-s", "format", "png", str(src), "--out", str(dst)], check=True, capture_output=True)
                src.unlink()
            w, h = dimensiones(dst)
            dst.with_suffix(".json").write_text(json.dumps({
                "id": id_, "origen": "chatgpt-navegador", "archivo": dst.name, "width": w, "height": h,
                "ingerido_en": datetime.datetime.now().isoformat(timespec="seconds"),
                "qc": {"estado": "pendiente", "notas": "generado en ChatGPT; revisar texto/rostros/formato"},
            }, ensure_ascii=False, indent=2))
            print(f"ok {id_} ← {src.name} ({w}x{h}) → {dst.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
