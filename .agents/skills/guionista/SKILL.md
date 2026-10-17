---
name: guionista
description: Escribe guiones de video documental explicativo con datos para YouTube (de 5 a 30 min) en español neutro, listos para voz clonada por TTS y para motion graphics en Remotion. Úsala SIEMPRE que el usuario pida un guion, "escribe el episodio", "el script del video", "la narración", "el texto de la voz en off", "estructura este tema en un video", o cuando haya que convertir una investigación, una conversación o un documento denso en una narrativa de video, aunque no diga la palabra "guion". También cuando pida revisar, acortar o medir un guion existente. Produce el AV script de dos columnas (audio | visual) que consumen las skills director-arte, productor y director-cine.
---

# Guionista

Convierte un tema (investigación, conversación, documento) en un guion de documental explicativo con datos, escrito para el oído, con presupuesto de palabras verificado contra la voz clonada, y con la información visual que necesita el resto del equipo.

El guion es el contrato aguas abajo: `director-arte` diseña escena por escena a partir de la columna VISUAL, `productor` desglosa assets y presupuesta render, `director-cine` marca ritmo y dirige la voz. Un guion ambiguo se convierte en tres retrabajos.

## Antes de escribir

1. **Lee la biblia de la serie** si existe (`docs/series/<serie>/biblia.md`): premisa, audiencia, tono, estructura recurrente, frases doctrina, duración objetivo. El episodio debe encajar en ese molde, no reinventarlo.
2. **Si la serie define un playbook de estilo** (ensayo de datos con tesis), léelo; no lo copies literal, adáptalo al tono de la biblia.
3. **Separa hechos de opinión.** Haz una lista corta de cada cifra que vas a usar con su fuente y año. Si una cifra no tiene fuente, o es una suma de universos distintos (por ejemplo "hospitales" de 2018 + "consultorios" de 2025), no la uses como cifra: úsala como ejemplo de por qué no hay dato confiable. Eso es narrativa, no debilidad.
4. **Escribe primero el gancho y el cierre**, después el medio. La retención de los primeros 30 segundos decide si el resto del guion se ve; escribirlo lineal produce ganchos tibios.
5. **Lista las 3 objeciones** que el público más polarizado dejaría en comentarios. Se responden dentro del guion.

## Principios (y por qué)

1. **Ancla concreta, luego pregunta, luego contexto.** Abre con algo filmable y específico (una cama vacía, un número extremo, un hospital con nombre) y lanza la pregunta en una frase. El contexto llega después, en pulsos cortos, cuando ya hay hambre de respuesta. Abrir con "El país tiene una crisis sanitaria" es contexto sin ancla: nadie se queda.
2. **Cero saludo, cero "en este video".** La primera frase debe ser citable. El guion tiene que poder cortarse desde la palabra uno sin perder sentido.
3. **Un dato = una escena.** Cada cifra necesita su propio plano, su comparación humana y su "así que…". Tres cifras en una oración se pierden tanto en el oído como en el TTS, y el director de arte no tiene cómo ilustrarlas.
4. **Comparación, no cifra aislada.** El cerebro no procesa "1,35 % del PIB"; procesa "menos de la cuarta parte de lo que la OPS considera el mínimo". Cada estadística va pegada a UNA comparación (estándar OMS, otro país de la región, escala doméstica).
5. **Breadcrumb cada ~2 minutos.** Cierra cada bloque con una promesa parcial hacia el siguiente ("pero esa cifra esconde algo peor"). Los análisis de retención muestran 15-25 % más de duración de visualización cuando existe esta técnica.
6. **Tesis fuerte, desarrollo matizado.** El título y el gancho pueden prometer fuerte; el cuerpo incluye un bloque explícito de honestidad epistémica ("esta cifra es un estimado; el censo real no existe"). Esa honestidad es la defensa contra sonar partidista y lo que convierte una promesa fuerte en confianza.
7. **Periodismo de soluciones, no de consignas.** Describe el problema con rigor y desplaza el eje a "qué se está intentando y qué evidencia hay de que funciona" (metodologías ya probadas en otras crisis, no deseos). Nunca ataques a un actor político por nombre sin una cifra con fuente que lo sostenga.
8. **Objeción anticipada.** Pon en boca del público el contraargumento y respóndelo ("Ustedes dirán: las cifras del gobierno son falsas. Precisamente por eso…"). Es el mecanismo antifrágil central: deja el video preparado para el primer comentario hostil.
9. **Escribe para el oído y para el TTS.** Oraciones de ≤ 22 palabras. Números en palabras tal como deben sonar ("mil doscientas veinte camas"). Siglas expandidas la primera vez y evitadas después ("la Organización Panamericana de la Salud" y luego "la OPS" solo si suena bien clonada; si no, "la organización"). Sin símbolos: "por ciento", "dólares", no `%` ni `$`. La voz clonada destroza siglas y lee mal las cifras.
10. **Presupuesto de palabras real.** La voz clonada habla a 2,5-3 palabras por segundo, pero con pausas de montaje, beats y respiros el rendimiento efectivo es **~2,2 palabras por segundo de video: ~130 por minuto, ~90 por 45 s** (medido en el reel 002). Un episodio de 26 min son ~3.400 palabras, no 4.300. Se mide antes de dar por bueno el borrador, no se recorta en montaje. Usa `scripts/presupuesto_vo.py`.
11. **Cierre ascendente.** Vuelve al ancla del inicio, eleva a principio (evidencia sobre consigna, agencia), imperativo suave, gancho al siguiente episodio. El último minuto es el más intenso, nunca un resumen plano.
12. **Cada escena lleva su intención visual.** La columna VISUAL no dice "gráfico de camas": dice qué se ve, qué se compara, qué texto ancla (2-5 palabras) y qué tipo de escena es (dato, mapa, ficha, b-roll, tarjeta). Sin eso el director de arte adivina.

## Estructura recomendada (episodio de 8-12 min)

| Bloque                      | Duración   | Función                                                                            |
| --------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Cold open / ancla           | 0:00-0:20  | Objeto o cifra concreta + la pregunta en una frase.                                |
| Promesa                     | 0:20-0:45  | Qué vas a poder ver al final que antes no veías (no "de qué trata").               |
| B1 · el problema con cifras | 0:45-3:00  | 2-3 datos duros, cada uno con escena y comparación. Breadcrumb al final.           |
| B2 · la herramienta         | 3:00-5:30  | Qué se puede hacer, quién lo ha hecho, evidencia. Aquí va una objeción anticipada. |
| B3 · el giro / matiz        | 5:30-7:30  | Qué no sabemos, qué es estimado, qué falta. Fuentes con rango.                     |
| B4 · el camino concreto     | 7:30-9:30  | Pasos técnicamente posibles ya: quién, con qué, en cuánto tiempo.                  |
| Cierre ascendente           | 9:30-10:30 | Vuelve al ancla, principio, imperativo, gancho al siguiente.                       |

Ningún bloque supera el 35 % del guion. Si un tema necesita más, es otro episodio. Adapta las duraciones a la biblia de la serie; conserva las funciones.

**Episodios largos (20-30 min).** La estructura anterior se convierte en el molde de cada **capítulo** (4-6 min): ancla propia, 2-3 datos, matiz, breadcrumb al siguiente. El episodio abre con un cold open + promesa global, encadena 5-6 capítulos numerados (son los capítulos de YouTube y los candidatos a spin-off) y cierra con un cierre ascendente único. Cada capítulo empieza con un **re-hook** (una pregunta o cifra nueva en sus primeros 10 s): en videos largos la retención cae en cada frontera de tema, y el re-hook es lo que la sostiene.

## Formato del guion

Escribe en `docs/series/<serie>/ep<NN>/guion.md` con exactamente esta forma — el script de presupuesto y las skills siguientes lo parsean:

```markdown
# EP01 — <Título de trabajo>

**Serie:** <nombre> · **Duración objetivo:** 10:00 · **Tesis:** <una frase>
**Título YouTube (propuesta):** … · **Miniatura (idea):** …

## Fuentes

- [F1] OPS, Perfil de país 2024 — <url> — cifra usada: …
- [F2] …

## Objeciones anticipadas

1. "…" → se responde en E07.

## Escenas

### E01 · cold open · ancla [0:00-0:12]

**VO:** Esta es una cama de hospital en una ciudad cualquiera. Nadie sabe cuántas como esta hay en el país. En serio: nadie lo sabe.
**VISUAL:** b-roll · cama vacía en pasillo de hospital, luz cruda de neón, Ken Burns lento hacia la cama.
**TEXTO:** —
**TIPO:** broll
**FUENTE:** —

### E02 · cold open · pregunta [0:12-0:20]

**VO:** ¿Cómo reconstruyes un sistema de salud si ni siquiera sabes cuántas camas tienes?
**VISUAL:** tarjeta · texto cinético sobre papel, golpe seco.
**TEXTO:** ¿CUÁNTAS CAMAS HAY?
**TIPO:** tarjeta
**FUENTE:** —
```

Reglas del formato:

- Una escena = un dato o una idea. El `VO` es el texto EXACTO que se manda al TTS (números y siglas ya resueltos). Un solo párrafo por escena.
- `TIPO` es uno de: `broll` (imagen FLUX + Ken Burns), `dato` (cifra animada), `mapa`, `ficha` (tarjeta de entidad, por ejemplo un hospital), `tabla`, `tarjeta` (texto sobre papel), `diagrama`, `comparacion`. Le dice al productor qué pipeline usa la escena.
- `TEXTO` es el ancla en pantalla (2-5 palabras) o `—`. Nunca repite literal la frase del VO: ancla la idea.
- `FUENTE` referencia `[Fn]` cuando la escena contiene una cifra; `ilustrativo` cuando los números son hipotéticos (la escena debe llevar el rótulo "ejemplo ilustrativo" en pantalla); `—` si no hay cifra.
- `**VO:** —` marca silencio deliberado (título de serie, respiro sin voz); solo en escenas `tarjeta`.
- Marca breadcrumbs y objeciones en el nombre de la escena (`· breadcrumb`, `· objeción`) para que sean verificables.

## Verificación (obligatoria antes de entregar)

```bash
python .agents/skills/guionista/scripts/presupuesto_vo.py docs/series/<serie>/ep<NN>/guion.md
```

Reporta palabras y segundos estimados por escena y total, y señala: escenas sin `TIPO`, oraciones > 22 palabras, dígitos y siglas en el VO, cifras sin `FUENTE`, tramos de más de ~2,5 min sin breadcrumb. Corrige hasta que el total quede dentro de ±8 % de la duración objetivo y no haya avisos rojos.

Luego repasa a mano:

- [ ] La primera frase es ancla o pregunta. Sin saludo.
- [ ] En los primeros 20-25 s hay una imagen concreta y una pregunta.
- [ ] Cada cifra tiene UNA comparación humana y atribución en la misma oración.
- [ ] Hay bloque explícito de honestidad epistémica.
- [ ] Al menos una objeción anticipada y respondida.
- [ ] El cierre pesa más que el desarrollo y engancha al siguiente episodio.
- [ ] Ninguna afirmación partidista sin cifra con fuente.
- [ ] La columna VISUAL de cada escena permite dibujarla sin preguntar.

## Anti-patrones

- Abrir con saludo, nombre del canal o "suscríbete".
- Cifra sin fuente ni rango ("500 hospitales colapsados").
- Tres datos en una oración.
- Sigla sin expandir; dígitos en el VO; `%` y `$` en el VO.
- Guion más largo de lo que la voz lee en la duración objetivo.
- Cerrar con "en conclusión, hoy vimos…".
- Ignorar las objeciones obvias del público polarizado.
- Escribir audio y visual por separado y sincronizar después: el desajuste se descubre en montaje.

## Referencias

- `references/investigacion.md` — hallazgos con fuentes (explainers de datos, Kurzgesagt, solutions journalism, TTS prompting). Léelo cuando dudes del porqué de una regla o necesites citar.
- `material/guiones/002-bola-de-nieve.md` — ejemplo real del proyecto con VO medido contra la voz clonada (lecciones de presupuesto y siglas).
