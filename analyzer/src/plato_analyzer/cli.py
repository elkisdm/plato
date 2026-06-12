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


def main() -> None:
    """Entrypoint del console_script `plato`."""
    app()


if __name__ == "__main__":
    main()
