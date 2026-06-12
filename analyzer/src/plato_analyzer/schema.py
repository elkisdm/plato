"""Carga y validación del VideoSpec contra la fuente de verdad (JSON Schema).

El schema vive en `schema/videospec.schema.json` en la raíz del repo (ADR-0001),
fuera del paquete. Lo resolvemos por ruta relativa, con override explícito para
tests y para usos donde el layout difiera.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


def default_schema_path() -> Path:
    """Ruta al schema canónico, resuelta desde la raíz del repo.

    Layout: <repo>/analyzer/src/plato_analyzer/schema.py
            <repo>/schema/videospec.schema.json
    """
    repo_root = Path(__file__).resolve().parents[3]
    return repo_root / "schema" / "videospec.schema.json"


def load_schema(schema_path: Path | str | None = None) -> dict[str, Any]:
    """Carga el JSON Schema desde disco."""
    path = Path(schema_path) if schema_path is not None else default_schema_path()
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


@dataclass(frozen=True)
class ValidationResult:
    """Resultado de validar un spec. `ok` es el gate duro."""

    ok: bool
    errors: list[str] = field(default_factory=list)

    def __bool__(self) -> bool:  # permite `if result:`
        return self.ok


def _format_error(error: Any) -> str:
    location = "/".join(str(p) for p in error.absolute_path) or "(raíz)"
    return f"{location}: {error.message}"


def validate_spec(
    spec: dict[str, Any],
    schema: dict[str, Any] | None = None,
) -> ValidationResult:
    """Valida un spec ya parseado. Junta TODOS los errores, no solo el primero."""
    schema = schema if schema is not None else load_schema()
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(spec), key=lambda e: list(e.absolute_path))
    if not errors:
        return ValidationResult(ok=True)
    return ValidationResult(ok=False, errors=[_format_error(e) for e in errors])


def validate_file(
    spec_path: Path | str,
    schema_path: Path | str | None = None,
) -> ValidationResult:
    """Carga un spec desde disco y lo valida contra el schema."""
    with Path(spec_path).open(encoding="utf-8") as fh:
        spec = json.load(fh)
    schema = load_schema(schema_path)
    return validate_spec(spec, schema)
