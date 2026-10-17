#!/usr/bin/env python3
"""Ensambla el VO final por escena: toma elegida (cruda) → aprieta pausas → máster →
E??.wav en <final>/, mide duraciones con ffprobe y escribe:
  - <final>/vo-dur.json      {id: segundos}   → copiar a ts/src/remotion/<serie>/ep<NN>/vo-dur.json
  - <final>/vo_full.wav      concatenación con pausas de montaje (solo para audición)
  - copia de los E??.wav a <public> si se indica.

Uso:
  vo_assemble.py <tomas/> <pick.json> <final/> [--public ts/public/ejemplo/ep01/vo] [--atempo 1.0]
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

FF = "/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg"
FP = "/opt/homebrew/opt/ffmpeg@7/bin/ffprobe"
TIGHT = ("silenceremove=start_periods=1:start_threshold=-38dB:start_silence=0.06:"
         "stop_periods=-1:stop_duration=0.30:stop_threshold=-38dB:stop_silence=0.16")
MASTER = ("highpass=f=75,adeclick,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=2,"
          "deesser=i=0.35,loudnorm=I=-16:TP=-1.5:LRA=9")


def dur(p: Path) -> float:
    return float(subprocess.check_output([FP, "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).decode().strip())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("tomas", type=Path)
    ap.add_argument("pick", type=Path)
    ap.add_argument("final", type=Path)
    ap.add_argument("--public", type=Path, default=None)
    ap.add_argument("--atempo", type=float, default=1.0, help="≤ 1.07; 1.0 = sin cambio")
    ap.add_argument("--gap", type=float, default=0.35, help="pausa entre escenas en vo_full (s)")
    args = ap.parse_args()
    args.final.mkdir(parents=True, exist_ok=True)
    pick: dict[str, str] = json.loads(args.pick.read_text())
    ids = sorted(pick, key=lambda k: int(k[1:]))
    tempo = f",atempo={args.atempo}" if args.atempo != 1.0 else ""
    vo_dur: dict[str, float] = {}
    partes: list[Path] = []
    for id_ in ids:
        src = args.tomas / pick[id_]
        out = args.final / f"{id_}.wav"
        subprocess.run([FF, "-v", "quiet", "-y", "-i", str(src), "-af", f"{TIGHT}{tempo},{MASTER}", "-ar", "48000", "-ac", "1", str(out)], check=True)
        d = round(dur(out), 3)
        vo_dur[id_] = d
        partes.append(out)
        print(f"{id_} {d:6.2f}s ← {pick[id_]}", flush=True)
        if args.gap > 0:
            gap = args.final / f"_gap_{id_}.wav"
            subprocess.run([FF, "-v", "quiet", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", str(args.gap), str(gap)], check=True)
            partes.append(gap)
    (args.final / "vo-dur.json").write_text(json.dumps(vo_dur, indent=2) + "\n")
    lst = args.final / "_concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in partes))
    subprocess.run([FF, "-v", "quiet", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "pcm_s16le", str(args.final / "vo_full.wav")], check=True)
    total = sum(vo_dur.values())
    print(f"VO total {total / 60:.1f} min (sin colchones de montaje) · vo_full con gaps: {dur(args.final / 'vo_full.wav') / 60:.1f} min")
    if args.public:
        args.public.mkdir(parents=True, exist_ok=True)
        for id_ in ids:
            shutil.copy2(args.final / f"{id_}.wav", args.public / f"{id_}.wav")
        print(f"copiados {len(ids)} wav a {args.public}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
