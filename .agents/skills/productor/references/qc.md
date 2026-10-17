# Checklists de QC

## Imagen (FLUX)

- [ ] Manos: número de dedos, deformaciones, fusiones con objetos.
- [ ] Texto: ningún cartel, pantalla o etiqueta con texto inventado (FLUX inventa letras).
- [ ] Rostros: ninguno frontal identificable; de espaldas, silueta o media distancia.
- [ ] Artefactos: bordes fantasma, duplicaciones, blending raro entre elementos.
- [ ] Composición: sujeto con margen para el recorrido del Ken Burns; foco donde debe.
- [ ] Coherencia de lote: mismo anclaje de serie y parámetros; si el look se fue, regenerar antes de seguir.
- [ ] Registrado: PNG + JSON espejo con prompt, seed, params, workflow.

## Voz (Chatterbox)

- [ ] WER ≤ 0,12 contra el VO del guion (ignorando números).
- [ ] Sin clics ni saltos de timbre en las uniones de frases.
- [ ] Misma referencia y parámetros que el resto del episodio (salvo instrucción por escena de `director-cine`).
- [ ] Duración real registrada (`voDur`) y comparada con el presupuesto de la escena (±15 %).
- [ ] True peak ≤ -1,5 dBTP; sin clipping.
- [ ] Énfasis en la palabra correcta (lo revisa `director-cine`; el productor marca dudas).

## Video (LTX / Ken Burns / Remotion)

- [ ] Sin frames congelados o duplicados (LTX en planos oscuros).
- [ ] Identidad del sujeto estable durante el clip.
- [ ] Sin banding en cielos y gradientes.
- [ ] Duración exacta pedida por la timeline.
- [ ] Texto legible en un teléfono (frame de prueba).

## Máster

- [ ] Loudness integrado -14 LUFS (±0,5), true peak ≤ -1,5 dBTP.
- [ ] Sincronía audio/video en tres puntos (inicio, medio, final).
- [ ] Cold open sin logo; intro ≤ 5 s; últimos 20 s limpios para end screen.
- [ ] SRT generado desde la alineación y revisado (siglas y números en su forma escrita, no en la fonética del VO).
- [ ] Capítulos en la descripción, miniatura 1280×720, título y descripción listos.
