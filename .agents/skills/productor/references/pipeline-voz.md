# Pipeline de voz (Chatterbox Multilingual, local)

Base: `ts/tools/vo-chatterbox.py` (frases + referencia fija) y `material/produccion/002-bola-de-nieve/scripts/vo_002_tomas_v3.py`, `vo_002_qc.py`, `vo_002_assemble.py`.

## 1. Preparar el texto

- Tomar el `VO` exacto de cada escena de `guion.md` (ya sin dígitos ni siglas).
- Partir por `. ; : ?` y reagrupar hasta ≥ 60 caracteres: Chatterbox alucina con fragmentos de dos palabras y trunca párrafos largos.
- Un bloque = una escena. Guardar el mapping escena → frases en el manifest.

## 2. Generar

- `audio_prompt_path` FIJO para todo el episodio (`~/Developer/personal/voz/referencia.wav`, 23 s limpios). Sin referencia la voz cambia en cada llamada.
- Parámetros por bloque los fija `director-cine` (`direccion.md`). Base sobria: `exaggeration=0.4-0.5, cfg_weight=0.5, temperature=0.6-0.8`. No cambiarlos a mitad de episodio salvo instrucción explícita por escena.
- `torch.manual_seed` fija por trozo: prosodia estable entre tomas.
- 4 tomas por bloque: `E07_t1.wav … E07_t4.wav`.
- Trampa: `perth.PerthImplicitWatermarker` es `None` en el venv → `perth.DummyWatermarker` antes de cargar, o `uv pip install "setuptools<81"`.

## 3. Elegir la toma

- Transcribir cada toma con faster-whisper; WER contra el texto de la escena ignorando números. Pasa ≤ 0,12.
- Entre las que pasan, elegir la de duración más cercana al presupuesto (palabras / 2,75) y sin artefactos audibles (clics, saltos de timbre).
- Registrar `qc.wer` y `archivo` en el manifest; copiar a `E07_final.wav`.

## 4. Ensamblar

- Concatenar frases con 0,28 s de silencio.
- `silenceremove` sobre tomas crudas (stop_silence ≈ 0,16) para colapsar pausas largas; `atempo` global ≤ 1,07 si hace falta ajustar.
- Medir duración real por escena con ffprobe → es la `voDur` de la timeline.

## 5. Normalizar (dos pasadas)

```bash
FF=/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg
# Pasada 1: medir
$FF -i vo.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
# Pasada 2: aplicar con los valores medidos
$FF -i vo.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<th>:linear=true" -ar 48000 vo_norm.wav
```

De-esser (si hay sibilancia) ANTES del loudnorm: `-af "deesser,loudnorm=…"`.

Nota: el VO se normaliza a -14 para referencia; el máster final (VO + música + SFX) también apunta a -14 integrado y -1,5 dBTP. La música entra 6-10 dB por debajo del VO (ver `director-cine`).

## 6. Alinear por palabra

- WhisperX (o faster-whisper con `word_timestamps=True`) sobre `vo_norm.wav` → `vo/alineacion.json` (palabra, inicio, fin).
- De ahí salen: subtítulos karaoke (`KaraokeCaption`), SRT para YouTube, y los `desdeFrame/hastaFrame` reales en la timeline (mejor que repartir proporcional por caracteres).
