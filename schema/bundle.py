#!/usr/bin/env python3
"""Dereferencia los $ref locales (#/$defs/...) del VideoSpec en un schema inlined.

json-schema-to-zod NO resuelve $ref a $defs (los emite como z.any()), a diferencia de
datamodel-code-generator que sí. Para alimentar al generador de Zod necesitamos un schema
con todo inlined. Los refs de Plató son locales y ACÍCLICOS, así que el inlining es seguro;
si algún día se introduce un ciclo, este script falla ruidosamente en vez de colgarse.

Uso:  python schema/bundle.py schema/videospec.schema.json schema/generated/videospec.bundled.json
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from typing import Any


def _resolve(node: Any, defs: dict[str, Any], stack: tuple[str, ...]) -> Any:
    if isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str):
            if not ref.startswith("#/$defs/"):
                raise ValueError(f"Solo se soportan refs locales a $defs; recibido: {ref}")
            name = ref[len("#/$defs/") :]
            if name in stack:
                raise ValueError(f"Ciclo de $ref detectado: {' -> '.join((*stack, name))}")
            if name not in defs:
                raise KeyError(f"$ref a definición inexistente: {name}")
            return _resolve(copy.deepcopy(defs[name]), defs, (*stack, name))
        return {k: _resolve(v, defs, stack) for k, v in node.items()}
    if isinstance(node, list):
        return [_resolve(item, defs, stack) for item in node]
    return node


def bundle(schema: dict[str, Any]) -> dict[str, Any]:
    defs = schema.get("$defs", {})
    resolved = {k: _resolve(v, defs, ()) for k, v in schema.items() if k != "$defs"}
    return resolved


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__)
        return 2
    src, dst = Path(argv[1]), Path(argv[2])
    schema = json.loads(src.read_text(encoding="utf-8"))
    bundled = bundle(schema)
    # $comment es válido en JSON Schema (a diferencia de un comentario //, que rompe JSON.parse).
    bundled = {
        "$comment": f"GENERADO desde {src.name} — NO editar a mano (ADR-0001). Regenerar: make codegen",
        **bundled,
    }
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(bundled, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"bundled → {dst}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
