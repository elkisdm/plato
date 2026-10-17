---
name: director-cine
description: Dirige ritmo, montaje, dirección de voz y diseño sonoro de videos documentales explicativos producidos en código (Remotion + ffmpeg, sin editor de video): decide duraciones, beats, cortes, Ken Burns con intención, parámetros de la voz clonada por bloque, capas y niveles de audio, apertura/cierre, y revisa los cortes (rough → fine → picture lock). Úsala SIEMPRE que haya que "dirigir", "montar", "el ritmo", "cómo suena la voz", "la música", "la mezcla", "revisa el corte", "el timeline", "cuánto dura cada escena", "por qué se siente lento/plano", o cuando haya que convertir guion + arte + assets en una timeline concreta, aunque el usuario no nombre el rol.
---

# Director de cine

Su producto es la timeline y el sonido: cuánto dura cada escena, dónde cae cada corte, cuándo respira la pantalla, cómo se dice cada frase y cómo se mezcla. Aquí todo se expresa en números (frames, segundos, LUFS, parámetros de TTS) porque el montaje se hace en código, no en Premiere.

## Cómo se monta en este repo

- Patrón de timeline: `ts/src/remotion/ored/timeline.ts`. Cada escena declara `vo`, `voDur` (medida con ffprobe), `voDesde` (silencio antes), `colchon` (aire después), `zoom` (desde/hasta/origen) y opcional `duracionSeg` para cortar antes de que termine el VO (L-cut). Duración de escena = `voDesde + voDur + colchon`. El clip se ralentiza para llenar la escena (`rate ≤ 1`), nunca se acelera.
- Curvas: `ts/src/remotion/paperMotion.ts` (lift, sombra, micro-movimiento); Remotion `interpolate` + `Easing`, sin CSS animations.
- Subtítulos karaoke: `KaraokeCaption`, alimentado idealmente por `vo/alineacion.json` (timestamps por palabra).
- Audio: mezcla en ffmpeg@7 (`amix`, `sidechaincompress` para ducking, `loudnorm` dos pasadas).

## Principios (y por qué)

1. **Cortar en la idea, no en el silencio.** El corte llega cuando entra información nueva, no cuando termina la frase. Así "siempre está pasando algo" sin que el montaje se note.
2. **L-cut por defecto.** El VO es la columna continua; la imagen corta libremente debajo. Separa el ritmo visual del verbal: cada cambio de imagen no se siente como cambio de escena. En la timeline: `duracionSeg` menor que el VO y la siguiente escena sin VO propio.
3. **Beat antes del dato clave.** 0,3-0,8 s de aire (plano se sostiene, música baja) justo antes de la cifra o afirmación fuerte; el gráfico entra en ese hueco. El silencio entrena al espectador: "esto importa".
4. **La pantalla respira tras un bloque denso.** 3-5 s sin texto nuevo, música que sube un poco. Sin eso, fatiga informativa al minuto 5.
5. **Texto ancla, no transcribe.** 2-5 palabras que refuerzan la idea; repetir literal el VO se siente como PowerPoint leído en voz alta. El karaoke es la única excepción.
6. **Ken Burns con dirección.** Push-in hacia el sujeto en tensión o pregunta; alejamiento o lateral en resolución o contexto. Un zoom sin motivo se lee como plantilla.
7. **Transición como puntuación.** Solo cuando significa algo (cambio de tema, salto temporal, cambio de escala). Todo lo demás: corte directo o L-cut. Sobreusada pierde su función de señal.
8. **Corte invisible.** Muchos cortes que no se sienten como cortes: la sensación es de avance constante. El objetivo no es velocidad sino que nunca se sienta estático.
9. **Ritmo documental, no viral.** 120-140 palabras por minuto en narración con datos, más lento que el explainer dinámico (150-170). Es una decisión: con cifras el espectador necesita tiempo de procesamiento.
10. **Leitmotiv y motivo recurrente.** Tema musical corto, transición firma, paleta por tipo de sección. Coherencia de serie = familia de variaciones, no repetición idéntica.
11. **Textura analógica como firma.** Grano, ligeros leaks, imperfección del papel: compensan la limpieza de lo sintético.
12. **Revisar por pasadas.** Estructura, luego ritmo, luego sonido. Mezclar criterios corrige lo visible e ignora lo estructural.

## Reglas numéricas (30 fps)

| Regla                                   | Valor                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Texto en pantalla, velocidad de lectura | ≥ 13 caracteres/s; cómodo 15-17; techo 20. Línea de 30 caracteres ≥ 2,3 s |
| Texto: caracteres por línea / líneas    | ≤ 30 / ≤ 3                                                                |
| Subtítulo karaoke, segmento mínimo      | 20 frames (0,8 s)                                                         |
| Gráfico legible tras su entrada         | ≥ 3,5 s                                                                   |
| Beat antes de dato clave                | 0,3-0,8 s (9-24 f)                                                        |
| Respiro tras bloque denso               | 3-5 s sin texto nuevo                                                     |
| Pausa dramática entre ideas             | 1-3 s (rara, con intención)                                               |
| `voDesde` típico                        | 0,4-0,6 s; 1,0 s en cold open                                             |
| `colchon` típico                        | 1,0-1,5 s; 2,4-2,6 s en revelación y cierre                               |
| Duración media de plano en b-roll       | 4-8 s; nunca < 2 s salvo ráfaga intencional                               |
| Cold open                               | 15-30 s, sin título de serie                                              |
| Intro / título de serie                 | ≤ 5 s, después del cold open                                              |
| End screen                              | últimos 20 s limpios                                                      |
| Narración                               | 120-140 wpm                                                               |

## Dirección de voz (Chatterbox)

Parámetros y su efecto:

- `exaggeration` (0,25-2): expresividad. Alto también **acelera** el habla; compensar bajando `cfg_weight`.
- `cfg_weight` (0-1): adherencia a la referencia. Alto + exaggeration alto = inestable.
- `temperature` (0,05-5): variación. Bajo = plano; alto = artefactos.

Base documental: `exaggeration 0.4-0.5 · cfg_weight 0.5 · temperature 0.6-0.8`. Subir `exaggeration` a 0,6-0,7 **solo** en frases de revelación o cierre, nunca en todo el guion (narración sobreactuada y acelerada). Los parámetros por escena se escriben en `direccion.md` y `productor` los aplica tal cual.

Marcado del VO (se aplica en el texto que va al TTS, no en el guion publicado):

- `…` = pausa corta (0,3-0,5 s); frase aparte o línea en blanco = pausa larga.
- Énfasis: reordenar la frase para que la palabra clave quede al final o después de una coma; el TTS enfatiza mejor por posición que por mayúsculas.
- Cambio de ritmo = cambio de bloque (parámetros distintos).

Evaluación de tomas: ¿suena a alguien contando o a alguien leyendo? ¿La entonación sube en pregunta y baja en cierre? ¿El énfasis cae en la palabra correcta? ¿Hay clics o saltos de timbre? El WER lo mide `productor`; la prosodia la juzga esta skill escuchando la toma elegida y la segunda mejor.

## Diseño sonoro

Capas por prioridad: **VO** → **SFX de motion** (pop al entrar un elemento, tick de contador, whoosh de transición firma) → **música** (cama; sube solo en pausas de VO) → **ambiente de b-roll** (casi subliminal).

Niveles (máster -14 LUFS integrado, true peak ≤ -1,5 dBTP):

- VO: -16 a -12 LUFS short-term.
- Música bajo VO: -22 a -28 LUFS; ducking 6-10 dB al entrar la voz, recuperación gradual (≥ 1,5 s) cuando calla.
- SFX: nunca sobre la voz; un pop por elemento, no por palabra.

Música por sección: pregunta/tensión → menor, lenta, sin percusión definida; revelación → swell corto o cambio de textura (no más volumen); esperanza/resolución → mayor, luminosa, con aire. La música apoya, no anticipa el giro.

Fuentes libres: Pixabay (música y SFX, sin atribución), Freesound filtrado CC0, YouTube Audio Library (verificar licencia por pista), Free Music Archive (verificar por pista). Registrar URL y licencia en el manifest.

## Apertura y cierre

- Cold open: pregunta, imagen o dato de alto impacto antes de cualquier marca; contexto incompleto a propósito.
- Título de serie: inmediatamente después, ≤ 5 s, leitmotiv + transición firma. Único momento de marca explícita.
- Cierre: resuelve el arco del episodio, vuelve al ancla del cold open, invitación breve integrada al tono (nunca "suscríbete YA").
- End screen: últimos 20 s con composición limpia en la zona de YouTube.

## Entregable — `docs/series/<serie>/ep<NN>/direccion.md`

Por escena, en el mismo orden que el guion:

```markdown
### E07 · revelación camas

**DURACION:** voDesde 0.5 · voDur <medida> · colchon 2.4
**CORTE:** L-cut: E06 termina 0.8 s antes de su VO; E07 entra sobre la voz.
**BEAT:** 0.6 s de aire antes de "ciento ochenta y seis"; la barra "operativas" crece en el hueco.
**CAMARA:** estática (dato).
**VOZ:** exaggeration 0.6 · cfg 0.45 · temp 0.7 — subir solo esta escena.
**SONIDO:** música baja a -26 en el beat; tick de contador; sin whoosh.
**TEXTO:** ancla entra al terminar la barra; sostener 3.5 s.
```

Más una sección `## Música` (pistas por bloque con URL/licencia) y `## Revisiones` (notas de cada pasada).

## Revisión de cortes

**Rough (estructura)** — solo VO + placeholders, sin música ni gráficos:

- ¿El arco se sostiene? ¿Cada bloque tiene función (contexto / tensión / dato / resolución)?
- ¿Hay redundancia entre bloques? Duración total dentro de ±8 % del objetivo.

**Fine (ritmo y visual)**:

- ¿Los cortes caen en idea nueva y no en silencio muerto?
- ¿Hay respiro después de cada bloque denso?
- ¿El texto cumple 13-17 cps y no transcribe el VO?
- ¿Cada Ken Burns tiene dirección intencional? ¿Cada transición significa algo?
- ¿Los beats antes de los datos clave existen y duran 0,3-0,8 s?

**Picture lock (sonido y entrega)**:

- VO -16 a -12 LUFS short-term constante; música duckea sin peleas; SFX presentes sin saturar.
- Máster -14 LUFS, ≤ -1,5 dBTP.
- Cold open, título ≤ 5 s y end screen en su sitio.
- Leitmotiv y motivo visual coherentes con episodios anteriores.

## Anti-patrones

- Texto que transcribe la voz.
- Zoom sin dirección; transición decorativa en cada corte.
- Música al nivel de la voz sin ducking ("no se entiende lo que dice").
- Ritmo viral (corte cada 1-2 s, 160 wpm) sobre contenido con cifras.
- `exaggeration` alto uniforme.
- CTA agresivo que rompe el registro documental.
- Entregar bajo -14 LUFS "por seguridad".
- Repetir el mismo corte/transición idéntico en todos los episodios: coherencia no es clonación.

## Referencias

- `references/investigacion.md` — fuentes: explainers tipo Vox (L-cut, corte invisible), subtitling.net y legibility.info (cps), loudness YouTube, documentación de parámetros Chatterbox, licencias de música libre.
- `ts/src/remotion/ored/timeline.ts` — timeline real de referencia.
- Memoria `pipeline-reel-local` — subtítulos kinéticos (grupos de 3 palabras, fin de grupo = inicio del siguiente).
