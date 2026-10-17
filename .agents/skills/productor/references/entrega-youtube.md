# Entrega para YouTube

## Export

- Contenedor MP4, H.264 (High), AAC-LC 48 kHz 384 kbps estéreo.
- 1080p30: ≥ 8 Mbps; 1080p60: 12 Mbps; 4K: 35-68 Mbps. Exportar en la resolución nativa del render; no upscalear.
- Color: BT.709 explícito (`-color_primaries bt709 -color_trc bt709 -colorspace bt709`) para que no se laven los tonos del papel.
- Audio final: -14 LUFS integrado, true peak ≤ -1,5 dBTP.

Comando de referencia (Remotion ya emite H.264; si se remuxa con ffmpeg):

```bash
FF=/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg
$FF -i render/epNN_v3.mp4 -i vo/mezcla_final.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 384k -ar 48000 render/epNN_final.mp4
```

## Subtítulos y capítulos

- SRT desde `vo/alineacion.json`, agrupado en líneas ≤ 30 caracteres, ≥ 0,8 s por segmento. En el SRT las cifras van en dígitos y las siglas en siglas (el VO fonético es solo para el TTS).
- Capítulos en la descripción: `00:00 <cold open>` … uno por bloque del guion, mínimo 3, cada uno ≥ 10 s.

## Metadatos (se preparan en producción, no después)

- Título (propuesta del guion), descripción con capítulos y fuentes citadas (URLs), tags.
- Miniatura 1280×720 (≤ 2 MB): coherente con la biblia visual, texto ≤ 4 palabras, sin rostro generado.
- End screen: últimos 20 s sin texto ni gráficos en la zona donde YouTube coloca los elementos.
