# hyperframes/

Segundo motor de render del estudio (ADR-0013): **Remotion compone, HyperFrames renderiza piezas.**
Un bloque del catálogo de [HyperFrames](https://github.com/heygen-com/hyperframes) (transición, overlay,
gráfico, fondo, intro) se renderiza con los colores de la marca y queda registrado como un asset de
video más del estudio (ADR-0011). Remotion lo usa con `PiezaHF` (`ts/src/estudio/kit/PiezaHF.tsx`).

| Ruta                         | Qué es                                                            | En git |
| ---------------------------- | ----------------------------------------------------------------- | ------ |
| `package.json`               | CLI `hyperframes` fijada por versión exacta                       | sí     |
| `pnpm-workspace.yaml`        | ajustes de pnpm 11 (`allowBuilds`), como en `ts/`                 | sí     |
| `upstream/`                  | clon parcial del repo oficial: `registry/` (catálogo) y `themes/` | no     |
| `piezas/<espacio>/<nombre>/` | copia de trabajo del bloque con sus variables, generada           | no     |

## Primera vez

```bash
pnpm -C hyperframes install
git clone --depth 1 --filter=blob:none --sparse https://github.com/heygen-com/hyperframes.git hyperframes/upstream
git -C hyperframes/upstream sparse-checkout set registry themes
```

Requiere Node 22+, ffmpeg y Chrome (la CLI lo diagnostica con `pnpm -C hyperframes exec hyperframes doctor`).

## Uso (desde `ts/`)

```bash
node tools/pieza.mjs buscar chart                     # busca en el catálogo por nombre, título, descripción o tags
node tools/pieza.mjs biblioteca bar-chart-race graficos/carrera --marca ejemplo
node tools/pieza.mjs biblioteca lt-clean-bar overlays/rotulo --alfa --calidad delivery
```

- `--marca` llena las variables de color que el bloque declare (`accent` ← `indigo`, `background` ← `noche`).
- `--var clave=valor` fija una variable a mano y gana sobre la marca. Solo se aceptan las que el bloque declara.
- `--alfa` renderiza webm con canal alfa (el bloque tiene que tener fondo transparente).
- `--calidad draft|looks|delivery` (por defecto `looks`).

Si el render falla, no se registra nada. Un render repetido con los mismos datos da el mismo archivo.

## Actualizar el catálogo

```bash
git -C hyperframes/upstream pull
```

Cada asset guarda en `origen.upstream` el commit del catálogo con que se hizo, así que actualizar no
cambia piezas ya registradas.

## Licencias

El código y el catálogo son Apache 2.0. Algunos bloques traen fuentes, imágenes, audio o modelos 3D de
terceros con licencia propia: se copia en `origen.licencia` lo que declare el bloque. Revísalo antes de
usar una pieza en un video comercial.
