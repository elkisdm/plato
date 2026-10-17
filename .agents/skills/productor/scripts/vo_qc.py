#!/usr/bin/env python3
"""QC + selección + máster de tomas de VO.

Uso (con el venv del analyzer, que tiene faster_whisper):
  cd analyzer && uv run python ../.agents/skills/productor/scripts/vo_qc.py <tomas/> <finalistas/> [--umbral 0.12]

1. Transcribe cada toma con faster-whisper y calcula WER contra el texto (ignora números).
2. Rankea por WER + desvío de duración respecto a la mediana de la escena.
3. Masteriza A (mejor) y B (alterna) por escena a -16 LUFS; escribe reporte-qc.json y pick.json (A por defecto).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

FF = "/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg"
MASTER = ("highpass=f=75,adeclick,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=2,"
          "deesser=i=0.35,loudnorm=I=-16:TP=-1.5:LRA=9")
NUM = set("""cero uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince
dieciseis diecisiete dieciocho diecinueve veinte veintiuno veintidos veintitres veinticuatro veinticinco
veintiseis veintisiete veintiocho veintinueve treinta cuarenta cincuenta sesenta setenta ochenta noventa
cien ciento cientos doscientos doscientas trescientos trescientas cuatrocientos cuatrocientas quinientos
quinientas seiscientos seiscientas setecientos setecientas ochocientos ochocientas novecientos novecientas
mil millon millones coma y""".split())


def norm(t: str) -> list[str]:
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    toks = re.sub(r"[^a-z0-9ñ ]", " ", t).split()
    return [w for w in toks if not w.isdigit() and w not in NUM]


def wer(ref: str, hyp: str) -> float:
    r, h = norm(ref), norm(hyp)
    d = [[0] * (len(h) + 1) for _ in range(len(r) + 1)]
    for i in range(len(r) + 1):
        d[i][0] = i
    for j in range(len(h) + 1):
        d[0][j] = j
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r)][len(h)] / max(1, len(r))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("tomas", type=Path)
    ap.add_argument("finalistas", type=Path)
    ap.add_argument("--umbral", type=float, default=0.12)
    ap.add_argument("--modelo", default="small")
    args = ap.parse_args()
    args.finalistas.mkdir(parents=True, exist_ok=True)

    from faster_whisper import WhisperModel

    manifest = json.loads((args.tomas / "manifest.json").read_text())
    model = WhisperModel(args.modelo, device="cpu", compute_type="int8")
    reporte_path = args.finalistas / "reporte-qc.json"
    reporte = json.loads(reporte_path.read_text()) if reporte_path.exists() else {}
    pick = {}
    for id_, spec in manifest.items():
        previo = {t["file"]: t for t in reporte.get(id_, [])}
        scored = []
        for toma in spec["tomas"]:
            if toma["file"] in previo and "wer" in previo[toma["file"]]:
                scored.append(previo[toma["file"]])
                continue
            segs, _ = model.transcribe(str(args.tomas / toma["file"]), language="es", vad_filter=True)
            hyp = " ".join(s.text for s in segs).strip()
            scored.append({**toma, "wer": round(wer(spec["texto"], hyp), 3), "hyp": hyp})
        durs = sorted(t["dur"] for t in scored)
        med = durs[len(durs) // 2]
        for t in scored:
            t["score"] = round(t["wer"] + 0.02 * abs(t["dur"] - med), 3)
        scored.sort(key=lambda t: t["score"])
        reporte[id_] = scored
        reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2))
        for rank, tag in zip(scored[:2], ["A", "B"]):
            dst = args.finalistas / f"{id_}-{tag}.wav"
            subprocess.run([FF, "-v", "quiet", "-y", "-i", str(args.tomas / rank["file"]), "-af", MASTER,
                            "-ar", "48000", "-ac", "1", str(dst)], check=True)
        pick[id_] = scored[0]["file"]
        flag = "  ! revisar/regenerar" if scored[0]["wer"] > args.umbral else ""
        print(f"{id_} A={scored[0]['file']} wer={scored[0]['wer']} dur={scored[0]['dur']}s{flag}", flush=True)
    (args.finalistas / "pick.json").write_text(json.dumps(pick, ensure_ascii=False, indent=2))
    total = sum(reporte[i][0]["dur"] for i in reporte)
    malos = [i for i in reporte if reporte[i][0]["wer"] > args.umbral]
    print(f"VO total (tomas A): {total / 60:.1f} min · escenas sobre umbral: {len(malos)} {malos}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
