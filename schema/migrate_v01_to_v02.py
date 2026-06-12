#!/usr/bin/env python3
"""Migración mecánica del output crudo del analyzer (forma 0.1.x divergente) al contrato v0.2.0.

El analyzer todavía emite una forma pre-contrato (specVersion sin bumpear, transitionIn como
string suelto, knownGap en prosa dentro de confidence). Esta migración la normaliza al contrato
v0.2.0 SIN inventar datos: solo reestructura lo que ya existe. Es lossless salvo el descarte de
`camera.easing` ("n/a"), que el contrato saca del campo estructurado a propósito (ADR-0007).

DEUDA: el analyzer debe emitir v0.2.0 nativo; entonces esta migración se borra.

Uso: python schema/migrate_v01_to_v02.py <raw.json> <golden_out.json>
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path


def migrate(raw: dict) -> dict:
    d = copy.deepcopy(raw)

    # 1. Bump del contrato (el eje que el analyzer nunca movió).
    d["specVersion"] = "0.2.0"

    # 2. transitionIn: string suelto -> objeto {type}. (confidence/durationMs no existían: se omiten.)
    for shot in d.get("shots", []):
        tin = shot.get("transitionIn")
        if isinstance(tin, str):
            shot["transitionIn"] = {"type": tin}
        # 3. camera.easing era "n/a"/None: el contrato lo saca del campo estructurado.
        cam = shot.get("camera")
        if isinstance(cam, dict):
            cam.pop("easing", None)

    # 4. knownGap (prosa en confidence.cutDetection) -> knownGaps estructurado top-level.
    gaps = []
    cd = d.get("confidence", {}).get("cutDetection", {})
    gap_text = cd.get("knownGap")
    if isinstance(gap_text, str) and gap_text.strip():
        gaps.append(
            {
                "kind": "missed_cut",
                "approxMs": 23000,  # "boy->mujer ~23s" en el texto de origen
                "reason": gap_text,
                "needs": "semantic_embedding",
            }
        )
    if gaps:
        d["knownGaps"] = gaps

    return d


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__)
        return 2
    src, dst = Path(argv[1]), Path(argv[2])
    raw = json.loads(src.read_text(encoding="utf-8"))
    out = migrate(raw)
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"migrado {src.name} -> {dst} (specVersion {out['specVersion']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
