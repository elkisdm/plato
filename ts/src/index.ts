// Punto de entrada del paquete @plato/schema.
// Re-exporta el schema Zod generado desde la fuente de verdad (ADR-0001).
// NO editar el schema acá: editá schema/videospec.schema.json y corré `make codegen`.

export { videoSpecSchema, type VideoSpec } from "../../schema/generated/zod.js";
