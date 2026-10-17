#!/usr/bin/env python3
"""Genera sfx.json para mezcla.py a partir de la timeline (tramos.json).

Regla del director-cine: un pop por elemento (no por palabra), tick en contadores, whoosh solo en
las transiciones firma (tarjetas de serie/capítulo). Los b-roll y las escenas heredadas no llevan SFX.

Uso: sfx_plan.py <tramos.json> <sfx_dir> <sfx.json>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

WHOOSH = {"tarjetaSerie", "tarjetaCapitulo"}
TICK = {"contador"}
SIN_SFX = {"broll", "cine"}
LIFT = 0.27  # el pop suena cuando la pieza "aterriza" (lift 27 f a 30 fps ≈ 0,9 s de curva; el golpe al inicio)


def main() -> int:
    tramos_p, sfx_dir, salida = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    tramos = json.loads(tramos_p.read_text())
    plan = []
    for t in tramos:
        comp = t["nombre"]
        if comp in SIN_SFX:
            continue
        if comp in WHOOSH:
            plan.append({"escena": t["id"], "offset": 0.0, "archivo": str(sfx_dir / "whoosh.wav"), "gain_db": -20})
        elif comp in TICK:
            plan.append({"escena": t["id"], "offset": max(0.0, t["voDesdeSeg"] - t["desdeSeg"]), "archivo": str(sfx_dir / "tick.wav"), "gain_db": -22})
        else:
            plan.append({"escena": t["id"], "offset": LIFT, "archivo": str(sfx_dir / "pop.wav"), "gain_db": -24})
    salida.write_text(json.dumps(plan, ensure_ascii=False, indent=1) + "\n")
    from collections import Counter
    print(f"{len(plan)} SFX →", dict(Counter(Path(p['archivo']).stem for p in plan)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
