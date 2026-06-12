"""CLI de Plató. Núcleo autónomo (ADR-0004): corre sin Claude; las skills lo envuelven.

M0 expone solo `validate`. Los subcomandos de análisis llegan en M1–M4.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import typer

from plato_analyzer.schema import validate_file

app = typer.Typer(
    name="plato",
    help="Plató — análisis de video a VideoSpec canónico.",
    no_args_is_help=True,
    add_completion=False,
)


@app.callback()
def _root() -> None:
    """Fuerza el modo multi-comando (Typer colapsaría un comando único)."""


@app.command()
def validate(
    spec: Path = typer.Argument(
        ...,
        exists=True,
        dir_okay=False,
        readable=True,
        help="Ruta al VideoSpec JSON a validar.",
    ),
    schema: Optional[Path] = typer.Option(
        None,
        "--schema",
        exists=True,
        dir_okay=False,
        readable=True,
        help="Override del schema (por defecto schema/videospec.schema.json).",
    ),
) -> None:
    """Valida un VideoSpec contra el schema. Gate duro: exit 0 si válido, 1 si no."""
    result = validate_file(spec, schema)
    if result.ok:
        typer.secho(f"✓ {spec} valida contra el schema.", fg=typer.colors.GREEN)
        raise typer.Exit(code=0)

    typer.secho(f"✗ {spec} NO valida ({len(result.errors)} error(es)):", fg=typer.colors.RED, err=True)
    for err in result.errors:
        typer.secho(f"  • {err}", fg=typer.colors.RED, err=True)
    raise typer.Exit(code=1)


@app.command()
def transcribe(
    media: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Video o audio a transcribir."),
    model: str = typer.Option("small", "--model", help="tiny|base|small|medium|large-v3."),
    language: str = typer.Option("es", "--lang", help="Idioma (es). Vacío = autodetectar."),
    out: Optional[Path] = typer.Option(None, "--out", help="Escribe el transcript JSON a esta ruta."),
    words: bool = typer.Option(False, "--words", help="Imprime timestamps por palabra."),
) -> None:
    """Transcribe audio con Whisper local (ADR-0006). Primer step mecánico de la capa de texto."""
    from plato_analyzer.asr import transcribe as run_asr

    typer.secho(f"Transcribiendo {media.name} con whisper '{model}' (primera vez descarga pesos)...", fg=typer.colors.CYAN, err=True)
    tr = run_asr(media, model_size=model, language=(language or None))
    typer.secho(f"idioma={tr.language} · {len(tr.segments)} segmentos · {tr.durationMs/1000:.1f}s", fg=typer.colors.GREEN, err=True)

    for s in tr.segments:
        typer.echo(f"[{s.startMs/1000:7.2f}–{s.endMs/1000:7.2f}] {s.text}")
        if words:
            typer.echo("    " + " ".join(f"{w.text}({w.startMs/1000:.2f})" for w in s.words))

    if out is not None:
        payload = {
            "language": tr.language,
            "durationMs": tr.durationMs,
            "segments": [
                {"startMs": s.startMs, "endMs": s.endMs, "text": s.text,
                 "words": [{"startMs": w.startMs, "endMs": w.endMs, "text": w.text, "prob": w.prob} for w in s.words]}
                for s in tr.segments
            ],
        }
        out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        typer.secho(f"→ {out}", fg=typer.colors.GREEN, err=True)


@app.command()
def ocr(
    video: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Video del cual extraer frames."),
    at: list[int] = typer.Option(..., "--at", help="Milisegundo(s) a leer. Repetible: --at 84500 --at 121200."),
    lang: str = typer.Option("spa", "--lang", help="Idioma Tesseract (spa)."),
    frames_dir: Optional[Path] = typer.Option(None, "--frames-dir", help="Si se da, guarda los frames extraídos ahí."),
) -> None:
    """OCR de texto gráfico sobre frames del video (Tesseract local). Step de la capa de texto."""
    from plato_analyzer.ocr import ocr_at

    if frames_dir is not None:
        frames_dir.mkdir(parents=True, exist_ok=True)
    for ms in at:
        keep = (frames_dir / f"frame_{ms}.png") if frames_dir is not None else None
        res = ocr_at(video, ms, lang=lang, keep_frame=keep)
        typer.echo(f"[{ms/1000:7.2f}s] {res.text!r}")


def _parse_window(raw: str) -> tuple[int, int]:
    """'START:END' en ms → (start, end). Ej: '83960:85300'."""
    try:
        start, end = (int(p) for p in raw.split(":", 1))
    except ValueError as exc:
        raise typer.BadParameter(f"--strip espera START:END en ms, recibí {raw!r}") from exc
    if end <= start:
        raise typer.BadParameter(f"--strip {raw}: end debe ser > start")
    return start, end


@app.command(name="dump-frames")
def dump_frames(
    video: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Video fuente."),
    spec: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="VideoSpec CV del cual derivar shots/knownGaps."),
    out: Path = typer.Option(..., "--out", help="Carpeta destino: escribe sheet_*.jpg, strip_*.jpg y manifest.json."),
    strip: list[str] = typer.Option([], "--strip", help="Ventana densa extra START:END en ms (micro-animación). Repetible."),
) -> None:
    """Vuelca contact sheets (un keyframe/shot) + strips densas para la sesión de visión (ADR-0007).

    Mecanismo validado por la pasada sandbox: el agente lee ~4 sheets + N strips, no cientos
    de frames sueltos. Las strips salen de knownGaps + las ventanas que pases con --strip.
    """
    import tempfile

    from plato_analyzer.ocr import extract_frame
    from plato_analyzer.vision import build_manifest, build_sheets, build_strips, render_grid

    spec_data = json.loads(spec.read_text(encoding="utf-8"))
    extra = [_parse_window(s) for s in strip]
    out.mkdir(parents=True, exist_ok=True)

    sheets = build_sheets(spec_data)
    strips = build_strips(spec_data, extra_windows=extra)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        for sh in sheets:
            cells = []
            for kf in sh.keyframes:
                frame = extract_frame(video, kf.ms, tmp_dir / f"{kf.shotId}.png")
                cells.append((frame, kf.label))
            render_grid(cells, out / f"{sh.id}.jpg", cols=4)
            typer.secho(f"✓ {sh.id}.jpg ({len(cells)} shots)", fg=typer.colors.GREEN, err=True)

        for st in strips:
            cells = []
            for ms in st.frameMs:
                frame = extract_frame(video, ms, tmp_dir / f"{st.id}_{ms}.png")
                cells.append((frame, f"{ms / 1000:.2f}s"))
            render_grid(cells, out / f"{st.id}.jpg", cols=8, cell_w=240, cell_h=135)
            typer.secho(f"✓ {st.id}.jpg ({len(cells)} frames @ {st.startMs}-{st.endMs}ms)", fg=typer.colors.GREEN, err=True)

    manifest = build_manifest(spec_data, extra_windows=extra)
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    typer.secho(f"✓ {len(sheets)} sheets + {len(strips)} strips + manifest.json → {out}", fg=typer.colors.GREEN, err=True)
    typer.secho("  Ahora una sesión de Claude Code lee las imágenes y escribe vision.json; luego: plato merge-vision.", fg=typer.colors.CYAN, err=True)


@app.command(name="merge-vision")
def merge_vision_cmd(
    spec: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="VideoSpec a enriquecer."),
    fragment: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="vision.json producido por la sesión de visión."),
    out: Optional[Path] = typer.Option(None, "--out", help="Destino (por defecto sobrescribe el spec)."),
) -> None:
    """Injerta el fragmento captions/textOverlays de la visión y re-valida el spec (gate duro)."""
    from plato_analyzer.vision import VisionMergeError, merge_vision

    spec_data = json.loads(spec.read_text(encoding="utf-8"))
    frag = json.loads(fragment.read_text(encoding="utf-8"))
    try:
        merged = merge_vision(spec_data, frag)
    except VisionMergeError as exc:
        typer.secho(f"✗ merge rechazado (spec sin tocar): {exc}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1)

    dst = out if out is not None else spec
    dst.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n_cap, n_ovl = len(merged.get("captions", [])), len(merged.get("textOverlays", []))
    typer.secho(f"✓ {dst}: {n_cap} captions, {n_ovl} textOverlays. Spec válido.", fg=typer.colors.GREEN, err=True)


@app.command(name="probe")
def probe_cmd(
    video: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Video a inspeccionar."),
    video_id: Optional[str] = typer.Option(None, "--id", help="ID del video (por defecto un slug del nombre)."),
    out: Optional[Path] = typer.Option(None, "--out", help="Escribe el bloque source JSON a esta ruta."),
) -> None:
    """Probe (M1): ffprobe → bloque `source` del VideoSpec. Primer filtro determinístico del CV."""
    from plato_analyzer.probe import probe as run_probe

    src = run_probe(video, video_id=video_id)
    payload = json.dumps(src.to_dict(), ensure_ascii=False, indent=2)
    typer.echo(payload)
    if out is not None:
        out.write_text(payload + "\n", encoding="utf-8")
        typer.secho(f"→ {out}", fg=typer.colors.GREEN, err=True)


@app.command(name="analyze")
def analyze_cmd(
    video: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Video a analizar."),
    out: Path = typer.Option(..., "--out", help="Escribe el VideoSpec CV (source+meta+shots)."),
    video_id: Optional[str] = typer.Option(None, "--id", help="ID del video (por defecto slug del nombre)."),
    full: bool = typer.Option(False, "--full", help="Enriquece cada shot con motion+color y re-etiqueta transiciones (lento: CV por shot)."),
) -> None:
    """probe + shots → VideoSpec CV. Con --full agrega motion/color/transiciones (M2)."""
    from datetime import date

    from plato_analyzer.probe import probe as run_probe
    from plato_analyzer.schema import validate_spec
    from plato_analyzer.shots import detect_shots

    src = run_probe(video, video_id=video_id)
    typer.secho(f"probe: {src.fps}fps {src.width}×{src.height} {src.codec} · {src.durationMs/1000:.1f}s", fg=typer.colors.CYAN, err=True)
    shots = detect_shots(video)
    typer.secho(f"shots: {len(shots)} detectados (AdaptiveDetector)", fg=typer.colors.CYAN, err=True)

    meta = {"analyzedAt": date.today().isoformat(), "analyzerVersion": "0.1.0", "shotDetection": "AdaptiveDetector"}

    if full:
        from plato_analyzer.color import color_for_shot
        from plato_analyzer.motion import motion_for_shot
        from plato_analyzer.transitions import relabel_shot_transitions

        typer.secho("enriqueciendo (motion + color + transiciones)...", fg=typer.colors.CYAN, err=True)
        shots = relabel_shot_transitions(shots, video)
        shot_dicts = []
        for s in shots:
            d = s.to_dict()
            mr = motion_for_shot(video, s.startMs, s.endMs)
            d["camera"] = mr.camera.to_dict()
            d["object"] = mr.object.to_dict()
            d["color"] = color_for_shot(video, s.startMs, s.endMs).to_dict()
            shot_dicts.append(d)
        from collections import Counter
        kinds = Counter(s.transitionIn for s in shots)
        typer.secho(f"transiciones: {dict(kinds)}", fg=typer.colors.CYAN, err=True)
        meta["shotDetection"] = "AdaptiveDetector + flash/dissolve labeler"
        meta["motion"] = "optical-flow + RANSAC (camera vs object)"
    else:
        shot_dicts = [s.to_dict() for s in shots]

    spec = {"specVersion": "0.2.0", "source": src.to_dict(), "meta": meta, "shots": shot_dicts}

    if full:
        from plato_analyzer.audio import analyze_audio
        from plato_analyzer.style import aggregate_style

        typer.secho("audio (loudness + silencios) + style...", fg=typer.colors.CYAN, err=True)
        audio = analyze_audio(video)
        spec["audio"] = audio.to_dict()
        spec["style"] = aggregate_style(shot_dicts, src.durationMs)
        typer.secho(f"audio: {audio.loudnessLufs} LUFS, {len(audio.silences)} silencios", fg=typer.colors.CYAN, err=True)

    result = validate_spec(spec)
    if not result.ok:
        typer.secho(f"✗ spec inválido: {result.errors}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1)

    out.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    layers = "source+meta+shots+motion+color+transiciones+audio+style" if full else "source+meta+shots"
    typer.secho(f"✓ {out}: spec CV válido ({len(shots)} shots, {layers}). Siguiente: plato dump-frames.", fg=typer.colors.GREEN, err=True)


def main() -> None:
    """Entrypoint del console_script `plato`."""
    app()


if __name__ == "__main__":
    main()
