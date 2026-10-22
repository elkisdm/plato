# arquitectura-ia — video LinkedIn "Arquitectura > Código"

Composición `ArquitecturaIA` (1080×1350, 30 fps, 60 s). Spec: `docs/specs/arquitectura-ia-linkedin.md`.

```bash
pnpm studio                                                      # previsualizar
npx remotion render src/remotion/index.ts ArquitecturaIA out/arquitectura-ia.mp4
```

| Carpeta                                      | Qué hay                                                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants/`                                 | `theme` (colores, tipografía, springs), `timings` (escenas y solapes), `soundCues` (markers de SFX y voz)                                                                                         |
| `lib/`                                       | Funciones puras con tests: `geometry` (conexiones bezier, longitud, punto por fracción de arco), `motion` (progresos, cámara), `pulses` (programación de pulsos y llegadas). `fonts` carga Geist. |
| `diagram/`                                   | Contrato de nodos/conexiones y el sistema multi-superficie compartido por las escenas 5–8                                                                                                         |
| `components/architecture/`                   | `Diagram` (renderer declarativo), nodos con microinteracciones, conexiones, pulsos, grupo, ventana                                                                                                |
| `components/typography/` · `ui/` · `motion/` | Titulares, captions, badges, preguntas, cámara, entrada/salida de escena                                                                                                                          |
| `scenes/`                                    | Las 8 escenas                                                                                                                                                                                     |

Decisiones no obvias:

- **Las conexiones se calculan desde los nodos**: mover un nodo estira su línea sola (así se separan los servidores en la escena de latencia).
- **La longitud de las curvas se muestrea en código**, no con `getTotalLength()`: el trazo y los pulsos dependen solo del frame.
- **Las microinteracciones salen de los pulsos**: `arrivals()` dice cuándo llega cada dato a un nodo; la DB late y el agente procesa en esos frames.
- **Continuidad por solape** (`OVERLAP`): cada escena dura 15 frames más y la siguiente entra encima.
- `→`, `≠` y `=` son SVG: el subset latin de Geist no los trae.
