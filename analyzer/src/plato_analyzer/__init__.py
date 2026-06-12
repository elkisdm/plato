"""plato-analyzer — crew de análisis que escribe el VideoSpec canónico.

En M0 solo el validador del schema está implementado.
"""

from plato_analyzer.schema import (
    ValidationResult,
    default_schema_path,
    load_schema,
    validate_file,
    validate_spec,
)

__all__ = [
    "ValidationResult",
    "default_schema_path",
    "load_schema",
    "validate_file",
    "validate_spec",
]

__version__ = "0.1.0"
