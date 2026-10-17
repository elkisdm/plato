#!/usr/bin/env python3
"""Copia a ts/public los assets aprobados de un episodio y escribe el inventario que
consume la composición (degradación clip → parallax → foto).

Uso: sincronizar_assets.py <material/produccion/<serie>/ep<NN>> <ts/public/<serie>/ep<NN>> <ts/src/remotion/<serie>/ep<NN>/assets.json>

Convenciones de entrada:
  keyframes/<ID>_k0N_s<seed>.png (+ .json con qc.estado; se prefiere k02 sobre k01 y solo
  aprobados o pendientes, nunca rechazados)
  clips/<ESCENA>_<modelo>.mp4        → clips[ESCENA]
  parallax/<ID>_<preset>.mp4         → parallax[ID]
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path


def elegir_keyframe(dir_: Path, id_: str) -> Path | None:
    for sufijo in ("k03", "k02", "k01"):
        for png in sorted(dir_.glob(f"{id_}_{sufijo}_*.png")):
            meta = png.with_suffix(".json")
            estado = json.loads(meta.read_text()).get("qc", {}).get("estado", "pendiente") if meta.exists() else "pendiente"
            if estado != "rechazado":
                return png
    return None


def main() -> int:
    origen, publico, inventario = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    rel = publico.relative_to(publico.parents[1])  # ejemplo/ep01 (relativo a public/)
    inv = {"clips": {}, "parallax": {}, "keyframes": {}}
    kf_dir = origen / "keyframes"
    ids = sorted({p.name.split("_")[0] for p in kf_dir.glob("*_k0*_*.png")})
    (publico / "keyframes").mkdir(parents=True, exist_ok=True)
    for id_ in ids:
        src = elegir_keyframe(kf_dir, id_)
        if src:
            dst = publico / "keyframes" / f"{id_}.png"
            shutil.copy2(src, dst)
            inv["keyframes"][id_] = f"{rel}/keyframes/{id_}.png"
    for carpeta, clave in (("clips", "clips"), ("parallax", "parallax")):
        d = origen / carpeta
        if not d.exists():
            continue
        (publico / carpeta).mkdir(parents=True, exist_ok=True)
        for mp4 in sorted(d.glob("*.mp4")):
            if mp4.parent.name == "prueba":
                continue
            id_ = mp4.name.split("_")[0]
            dst = publico / carpeta / f"{id_}.mp4"
            shutil.copy2(mp4, dst)
            inv[clave][id_] = f"{rel}/{carpeta}/{id_}.mp4"
    inventario.write_text(json.dumps(inv, indent=2, sort_keys=True) + "\n")
    print(f"keyframes {len(inv['keyframes'])} · clips {len(inv['clips'])} · parallax {len(inv['parallax'])} → {inventario}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
