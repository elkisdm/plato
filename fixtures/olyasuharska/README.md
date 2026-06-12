# Fixture: @olyasuharska — "Vemos una película"

`videospec-olyasuharska.json` es el **golden de FORMA del schema**, no un ground-truth de exactitud del pipeline. La distinción importa (ver veredicto del 2026-06-12).

## Qué es confiable y barato (úsalo como verdad)
- **Pacing** (cutsPerMin, medianShotMs, buckets) — determinístico.
- **Color** (meanLab, temperature, saturation por shot) — y la señal fuerte: la partición 15 cálidos-saturados / 49 neutros-desaturados **separó sola los dos mundos visuales**. Propiedad de estilo emergida de una métrica tonta.
- **Estructura en 4 actos** y el **sistema de captions** (karaoke dorado-glow, 2 frames de flash blanco entre mundos).

## Qué NO es output mecánico (no lo trates como ground-truth)
- **`captions` / `textOverlays`:** los leyó un HUMANO mirando frames, no Whisper/OCR. `source: "vision"` aquí = persona, no el step de visión del pipeline. Es maqueta de forma hasta que ASR+OCR local lo reproduzcan solos.
- **`shots[].motion`:** la capa más floja. magnitude/easing son **direccionales, no medición**. "Nada está quieto" está inflado: en collages el optical flow lee el movimiento de recortes (pájaros) como paneo de cámara, y al sujeto acercándose como zoom. La `confidence` del motion en este fixture es generosa.
- **`transitions` tipo `dissolve_or_fast_motion`:** cajón de sastre (14/63) que mezcla disolvencias reales con cortes sobre movimiento.

## Uso
Validar la **forma** del schema (gate, codegen). NO derivar métricas de precisión/recall del pipeline a partir de este archivo.
