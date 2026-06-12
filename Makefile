# Plató — orquestador de codegen y verificación.
# El codegen cruza dos lenguajes (ADR-0005), así que vive en la raíz, no en un solo lado.

SCHEMA      := schema/videospec.schema.json
BUNDLED     := schema/generated/videospec.bundled.json
PYDANTIC    := schema/generated/pydantic_models.py
ZOD         := schema/generated/zod.ts
GEN_HEADER  := \# GENERADO desde schema/videospec.schema.json — NO editar a mano (ADR-0001). Regenerar: make codegen

.PHONY: codegen codegen-pydantic codegen-zod validate test

## Regenera tipos en ambos lenguajes desde la fuente de verdad (ADR-0001).
codegen: codegen-pydantic codegen-zod

## Pydantic v2 desde el JSON Schema (datamodel-code-generator resuelve $ref nativo).
codegen-pydantic:
	cd analyzer && uv run datamodel-codegen \
		--input ../$(SCHEMA) \
		--input-file-type jsonschema \
		--output ../$(PYDANTIC) \
		--output-model-type pydantic_v2.BaseModel \
		--use-standard-collections \
		--use-union-operator \
		--target-python-version 3.11 \
		--use-schema-description \
		--field-constraints \
		--formatters black --formatters isort \
		--custom-file-header "$(GEN_HEADER)"

## Zod desde un schema dereferenciado (json-schema-to-zod NO resuelve $ref → bundle primero).
codegen-zod:
	python3 schema/bundle.py $(SCHEMA) $(BUNDLED)
	cd ts && npx json-schema-to-zod -i ../$(BUNDLED) -o ../$(ZOD) -n videoSpecSchema -t VideoSpec -d 100 -zv 3

## Valida el golden fixture contra el schema (gate duro).
validate:
	cd analyzer && uv run plato validate ../fixtures/olyasuharska/videospec-olyasuharska.json

## Corre la suite del validador.
test:
	cd analyzer && uv run pytest -q
