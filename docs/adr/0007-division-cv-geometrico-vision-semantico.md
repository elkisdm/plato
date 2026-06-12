# ADR-0007 — CV resuelve lo geométrico/medible; la visión resuelve lo semántico

- **Estado:** Propuesto
- **Fecha:** 2026-06-12
- **Decisor:** edaza
- **Respalda (KB):** criterio general — no cubierto por la KB. Decisión basada en evidencia empírica de dos corridas sandbox sobre @olyasuharska (color v1, motion v2/RANSAC).

## Contexto

Dos resultados empíricos del análisis obligan a precisar de quién es cada parte del trabajo analítico:

1. **El color (una métrica tonta) separó solo los dos mundos visuales:** LAB por shot partió los 64 shots en 15 cálidos-saturados / 49 neutros-desaturados, coincidiendo casi exacto con talking-head vs collage. Una propiedad de estilo emergió de geometría barata.
2. **RANSAC sobre features rastreados separó cámara de objeto** y se auto-corrigió (37 "pans" de flow denso → 14 reales; la hipótesis "los recortes inflan" resultó al revés: era el sujeto). El CV, hecho bien, hizo **análisis estructural real**, no solo "encontrar dónde mirar".

Esto **afina** una hipótesis previa demasiado débil ("el analizador es visión guiada por CV barato; el CV solo localiza ventanas"). El CV sí analiza — lo geométrico. Lo que el CV NO puso fue el "qué está pasando": estilo, sentido y animación de captions, lectura cualitativa. Eso vino de la visión. Además, la capa de motion **hereda la calidad del shot-detection** (un corte perdido envenena el motion del shot), así que la robustez del CV de cortes tiene efecto multiplicador hacia abajo.

## Decisión

Dividir la responsabilidad analítica por la **naturaleza de la pregunta**, no por etapa:

- **CV (determinístico, barato, honesto-con-incertidumbre) → lo geométrico y medible:** detección de cortes, pacing, color, motion (cámara/objeto vía RANSAC). Hecho bien —features + RANSAC en vez de flow denso, umbrales sobre el piso de ruido— produce hechos confiables con `confidence`. Cuando la geometría es ambigua (sujeto llena el cuadro), se **flagea**, no se adivina.
- **Visión (Claude multimodal, cara, semántica) → el "qué pasa":** estilo, vocabulario de transición, animación/sentido de captions. Opera sobre **ventanas que el CV localiza**, nunca sobre el video entero.

El alto leverage NO es pulir un método de CV indefinidamente. Es: (a) que el CV barato **localice bien las ventanas** para la visión, y (b) **robustez en cut-detection**, porque toda capa geométrica de abajo hereda su calidad.

## Consecuencias

- **Positivas:** claridad de inversión — no semanas en optical flow denso; sí en cut-detection robusto (disolvencias, cortes sobre movimiento, flashes) y en window-targeting para la visión. Modelo de costo acotado: visión solo sobre ventanas.
- **Negativas / costos:** la frontera CV/visión no es limpia en los bordes; hay que aceptar flags de ambigüedad en vez de forzar una etiqueta. La capa de motion seguirá siendo la de menor confianza por límite físico (frames muestreados).
- **Trigger de re-evaluación:** el test mecánico de OCR + Whisper local es el juez. Si la capa de texto sale sola → producto (visión = motor automático). Si necesita un humano sistemáticamente para el "qué pasa" → es un asistente humano-en-el-loop, lo que cambia el posicionamiento del producto (no la arquitectura).
