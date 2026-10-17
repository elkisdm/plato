#!/usr/bin/env python3
"""Exporta guion.md → JSON {id: {vo, tipo, nombre, texto, fuente}} para que la
composición Remotion use el VO exacto como subtítulo sin duplicarlo a mano.

Uso: exportar_guion.py <guion.md> <salida.json>
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "guionista" / "scripts"))
import presupuesto_vo  # noqa: E402

guion, salida = Path(sys.argv[1]), Path(sys.argv[2])
_, escenas = presupuesto_vo.parsear(guion.read_text(encoding="utf-8"))
data = {e.id: {"vo": e.vo, "tipo": e.tipo, "nombre": e.nombre.strip(" ·"), "texto": e.texto, "fuente": e.fuente} for e in escenas}
salida.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(data)} escenas → {salida}")
