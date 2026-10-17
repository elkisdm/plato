# ADR-0012 — Identidad en movimiento y formatos por tipo

- **Estado:** Aceptado
- **Fecha:** 2026-10-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB.

## Contexto

Una marca necesita publicar piezas de Instagram, TikTok y LinkedIn que siempre se vean de
la marca. Hasta ahora el estudio (ADR-0011) tenía un kit genérico, tipos de video para producto y
anuncios verticales de Meta, pero ningún componente de identidad reutilizable ni un tipo pensado
para redes. Además, los formatos eran implícitos: las escenas existentes asumen solo horizontal o
vertical 9:16, y un 4:5 (1080×1350) rompería ~30 escenas si se agregara a todos los tipos.
Por último, hay reglas de contenido que dependen de la persona que aparece en un asset: el contrato
de una persona embajadora de la marca prohíbe mostrar precios o cuotas junto a ella, y eso hoy vive
solo en `contexto.md` y en la memoria del equipo.

## Decisión

1. **Componentes de identidad en `ts/src/estudio/kit/identidad/`, agnósticos de marca.** `FirmaLogo`,
   `CierreMarca`, `Zocalo`, `TarjetaCita`, `TarjetaDato`, `FotoViva` y `TransicionMarca` leen todo de
   `marca.json`: colores, tipografías, logos y el nuevo bloque `identidad`. No hay colores ni
   nombres fijos en el kit; una marca sin `identidad` sigue siendo válida.
2. **Tipo de video `redes`** (`ts/src/estudio/tipos/redes/`) para piezas sociales: escenas `firma`,
   `foto`, `pantalla`, `cita`, `dato`, `mosaico`, `clip` y `cierre`, con subtítulos palabra por
   palabra y zócalo opcional. Admite 60 fps.
3. **Formatos declarados por tipo.** Se suma el formato `retrato` (1080×1350). Cada catálogo declara
   sus `formatos` (por defecto `horizontal` y `vertical`), y `validarFormatos` rechaza en la
   resolución un formato no soportado, igual que `validarFps`. Solo `redes` declara `retrato`. Para
   `useVertical`, `retrato` cuenta como vertical, así que las escenas que distinguen vertical de
   horizontal no cambian y no reciben `retrato`.
4. **Restricciones de contenido en `marca.json`** (`restricciones`): reglas data-driven de la forma
   `{ siAsset, prohibido, motivo }`. `siAsset` es un regex sobre los ids de assets usados y
   `prohibido` un regex sobre el texto (locución y texto en pantalla). Se prueban en cada proyecto de
   la marca, como `redaccion`. Primer uso: si aparece una foto de la persona embajadora, el texto no puede
   mencionar precios, UF, pie ni cuotas.
5. **`SubtitulosPalabra` se mueve de `tipos/anuncio/` a `kit/`** para que `redes` y `anuncio` lo
   compartan. Deuda conocida: todavía importa `Base`, `Sistema` y `calculos` de `tipos/anuncio/`; el
   desacople queda para una tarea aparte.

## Consecuencias

- **Positivas:** una pieza nueva de la marca sale de datos (`guion.json`) y no de código; el mismo kit
  sirve a otras marcas; la regla del embajador deja de depender de la memoria humana y falla en CI.
- **Negativas / costos:** `retrato` existe en el esquema pero solo `redes` lo admite, así que hay que
  recordar declararlo al crear un tipo nuevo. `SubtitulosPalabra` sigue atado a `tipos/anuncio/`
  hasta pagar la deuda. Las restricciones son regex: cubren los casos conocidos, no todo el lenguaje
  (un precio escrito de forma rara puede pasar).
- **Trigger de re-evaluación:** si una restricción da falsos positivos o negativos repetidos, o si
  aparece una segunda marca con reglas de contenido que no caben en regex, revisar el mecanismo.
  Si un tipo nuevo necesita un formato que el esquema no contempla, revisar `formatos`.

## Alternativas consideradas

- **Agregar 4:5 a todos los tipos:** descartado. Rompe escenas existentes que asumen horizontal o
  vertical y obliga a revisar ~30 escenas sin necesidad.
- **Componentes de identidad hardcodeados para una marca concreta:** descartado. El kit tiene que
  servir a cualquier marca, y la marca ya está en `marca.json`.
- **Revisión humana solo para la regla del embajador:** descartado. El riesgo es contractual y
  automatizar la regla es barato: un test por proyecto.
