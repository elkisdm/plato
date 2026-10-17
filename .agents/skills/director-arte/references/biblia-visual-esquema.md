# Biblia visual — <Serie>

Versión: 0.1 · Fecha: AAAA-MM-DD · Base: `ts/src/remotion/paperTokens.ts`

## 1. Paleta con roles semánticos

| Rol          | Hex             | Uso permitido                      | Prohibido                  |
| ------------ | --------------- | ---------------------------------- | -------------------------- |
| papel-base   | #f3eede→#ded5bf | fondo de toda escena               | texto                      |
| tinta        | #141109         | texto principal, bordes            | fondos grandes             |
| tinta-muted  | #5a554c         | conectores, etiquetas secundarias  | cifras clave               |
| acento       | #E8B84B         | palabra énfasis, resaltado karaoke | rellenos de gráfico        |
| dato-deficit |                 | barras/estados con carencia        | cualquier otro significado |
| dato-ok      |                 | cobertura adecuada                 |                            |
| agua         |                 | métricas de agua                   |                            |
| energia      |                 | métricas de electricidad           |                            |
| neutral-mapa |                 | estados sin dato                   |                            |

## 2. Tipografía y escala (px a 1080p)

| Nivel               | Familia | Peso | Tamaño mín. | Uso                |
| ------------------- | ------- | ---- | ----------- | ------------------ |
| H1 episodio         |         |      |             | tarjeta de título  |
| Ancla de escena     |         | 800  | 48          | texto 2-5 palabras |
| Cifra destacada     |         |      | 72          | contador           |
| Etiqueta / conector |         | 300  | 32          | ejes, IDs, fuentes |

Máximo 30 caracteres por línea, 3 líneas.

## 3. Grid y zonas

- Safe area: 5 % por lado.
- Zona subtítulos karaoke: banda inferior (y ≥ 84 %), reservada.
- Fichas: tercio derecho. Anclas: tercio inferior-izquierdo o centro según escena.

## 4. Motion tokens (30 fps)

| Gesto                             | Frames          | Easing      | Nota           |
| --------------------------------- | --------------- | ----------- | -------------- |
| Entrada elemento (lift)           | 27              | out-cubic   | overshoot leve |
| Salida elemento                   | 14              | in-cubic    |                |
| Contador de cifra                 | 40-60           | out-quart   |                |
| Barra crece                       | 45              | out-quart   | stagger 10 f   |
| Cámara continua (mapa, Ken Burns) | escena completa | in-out-sine | nunca lineal   |
| Transición firma                  | 18              |             | definir        |

## 5. Iconografía

Set en paper-cutout: hospital, cama, gota, rayo, antena, persona, ambulancia, píldora. Archivos en `ts/public/<serie>/iconos/`.

## 6. Tratamiento del b-roll

Curva de color única (definir LUT o parámetros), grano papel `multiply` 0.35, marco 12 px papel, sombra de foto pegada (offset 6/10 px, blur 18, 0.35).

## 7. Componentes recurrentes

| Componente        | Props                      | Animación                           |
| ----------------- | -------------------------- | ----------------------------------- |
| ficha-entidad     | id, nombre, lugar, filas[] | lift + filas stagger 6 f            |
| barra-comparativa | series[], colores por rol  | estructura instantánea, barras 45 f |
| contador          | valor, unidad, fuente      | 50 f out-quart                      |
| mapa-coropletico  | nivel ADM, métrica, escala | cámara continua                     |
| mapa-puntos       | puntos[], magnitud         | stagger por lotes                   |
| tarjeta-cita      | texto, fuente              | fade 12 f                           |

## 8. Do / Don't

- Do: una dirección de luz; etiqueta en el elemento; rostros de espaldas.
- Don't: sombra dura; pie chart; texto FLUX; lineal en entradas.

## 9. Anclaje FLUX de la serie

```
<pegar aquí el bloque fijo>
```

Parámetros fijos: 1344×768 · 24 steps · guidance 3.5 · sampler <definir>.
