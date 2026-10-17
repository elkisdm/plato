#!/usr/bin/env python3
"""Mezcla final: VO por escena (posicionado en su voDesde absoluto) + camas de música por
bloque con ducking bajo la voz + SFX opcionales → mezcla_final.wav a -14 LUFS / -1.5 dBTP.

Uso:
  mezcla.py <tramos.json> <vo_dir/> <musica.json> <salida.wav> [--sfx sfx.json]

tramos.json: lo escribe `PRINT_TRAMOS=1 vitest run tramos.print` (out/tramos-ep01.json).
musica.json: [{"desde": "E01", "hasta": "E05", "archivo": "musica/cold.mp3", "gain_db": -24,
              "fade_in": 1.5, "fade_out": 2.0}, ...]  (bloques por id de escena, inclusivo)
sfx.json (opcional): [{"escena": "E02", "offset": 0.6, "archivo": "sfx/pop.wav", "gain_db": -18}]

Niveles (director-cine §4): VO -16 LUFS short-term (ya masterizado), música -24 bajo voz con
ducking 8 dB (sidechaincompress), máster -14 LUFS integrado.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

FF = "/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("tramos", type=Path)
    ap.add_argument("vo_dir", type=Path)
    ap.add_argument("musica", type=Path)
    ap.add_argument("salida", type=Path)
    ap.add_argument("--sfx", type=Path, default=None)
    ap.add_argument("--duck_db", type=float, default=8.0)
    args = ap.parse_args()

    tramos = json.loads(args.tramos.read_text())
    por_id = {t["id"]: t for t in tramos}
    total = max(t["desdeSeg"] + t["duracionSeg"] for t in tramos)
    musica = json.loads(args.musica.read_text())
    sfx = json.loads(args.sfx.read_text()) if args.sfx else []

    inputs: list[str] = []
    filtros: list[str] = []
    vo_labels: list[str] = []
    idx = 0
    # VO: cada escena en su instante absoluto.
    for t in tramos:
        if t["voDesdeSeg"] is None:
            continue
        wav = args.vo_dir / f"{t['id']}.wav"
        if not wav.exists():
            print(f"! falta {wav}", file=sys.stderr)
            continue
        inputs += ["-i", str(wav)]
        delay_ms = int(round(t["voDesdeSeg"] * 1000))
        filtros.append(f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay={delay_ms}|{delay_ms}[vo{idx}]")
        vo_labels.append(f"[vo{idx}]")
        idx += 1
    filtros.append(f"{''.join(vo_labels)}amix=inputs={len(vo_labels)}:normalize=0[vo]")
    filtros.append("[vo]asplit=2[vo_mix][vo_sc]")

    # Música por bloque: recortada al bloque, fades, gain, delay.
    mus_labels: list[str] = []
    for i, m in enumerate(musica):
        ini = por_id[m["desde"]]["desdeSeg"]
        fin_t = por_id[m["hasta"]]
        fin = fin_t["desdeSeg"] + fin_t["duracionSeg"]
        dur = fin - ini
        inputs += ["-i", str(m["archivo"])]
        fi, fo = m.get("fade_in", 1.5), m.get("fade_out", 2.0)
        filtros.append(
            f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d={fi},afade=t=out:st={max(0, dur - fo):.3f}:d={fo},volume={m.get('gain_db', -24)}dB,"
            f"adelay={int(ini * 1000)}|{int(ini * 1000)}[m{i}]"
        )
        mus_labels.append(f"[m{i}]")
        idx += 1
    if mus_labels:
        filtros.append(f"{''.join(mus_labels)}amix=inputs={len(mus_labels)}:normalize=0[mus_raw]")
        # Ducking: la música baja `duck_db` cuando hay voz, recupera en ~1.5 s.
        ratio = 1 + args.duck_db / 4
        filtros.append(f"[mus_raw][vo_sc]sidechaincompress=threshold=0.05:ratio={ratio:.2f}:attack=40:release=1500:makeup=1[mus]")
    else:
        filtros.append("[vo_sc]anullsink")

    # SFX puntuales.
    sfx_labels: list[str] = []
    for j, s in enumerate(sfx):
        t = por_id[s["escena"]]
        at = t["desdeSeg"] + s.get("offset", 0)
        inputs += ["-i", str(s["archivo"])]
        filtros.append(f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s.get('gain_db', -18)}dB,adelay={int(at * 1000)}|{int(at * 1000)}[s{j}]")
        sfx_labels.append(f"[s{j}]")
        idx += 1

    capas = ["[vo_mix]"] + (["[mus]"] if mus_labels else []) + sfx_labels
    filtros.append(f"{''.join(capas)}amix=inputs={len(capas)}:normalize=0,apad=whole_dur={total:.3f},atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    cmd = [FF, "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filtros), "-map", "[out]", "-ar", "48000", "-ac", "2", str(args.salida)]
    subprocess.run(cmd, check=True)
    print(f"mezcla → {args.salida} ({total / 60:.1f} min)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
