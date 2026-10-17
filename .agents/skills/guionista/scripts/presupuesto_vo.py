#!/usr/bin/env python3
"""Mide un guion.md contra la voz clonada y las reglas de la skill guionista.

Uso: presupuesto_vo.py <guion.md> [--wps 2.2]
Sale con 1 si hay avisos rojos (para usarlo como gate).

wps = palabras por segundo EFECTIVAS de video (habla ~2.5-3 + pausas de montaje,
beats y respiros): 2.2 ≈ 130 palabras/min, ritmo documental. Medido en el reel 002:
90 palabras → 45 s.
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

TIPOS = {"broll", "dato", "mapa", "ficha", "tabla", "tarjeta", "diagrama", "comparacion"}
TIPOS_CON_CIFRA = {"dato", "tabla", "comparacion", "mapa", "ficha"}
MAX_PALABRAS_ORACION = 22
MAX_SEG_SIN_BREADCRUMB = 150.0
TOLERANCIA_TOTAL = 0.08

SIN_VALOR = {"", "—", "-"}
FUENTE_ILUSTRATIVA = "ilustrativo"
SEPARADORES_ANCLA = {"·", "→", "≠", "vs", "+", "/", "—", "-", "=", "<", ">"}

ESCENA_RE = re.compile(r"^###\s+(E\d+)\s*(.*?)\s*(?:\[[^\]]*\])?\s*$")
CAMPO_RE = re.compile(r"^\*\*([A-ZÁÉÍÓÚ]+):\*\*\s*(.*)$")
OBJETIVO_RE = re.compile(r"\*\*Duración objetivo:\*\*\s*(\d+):(\d{2})")
SIGLA_RE = re.compile(r"\b[A-ZÁÉÍÓÚ]{2,}\b")


@dataclass
class Escena:
    id: str
    nombre: str
    vo: str = ""
    tipo: str = ""
    fuente: str = ""
    texto: str = ""
    avisos: list[str] = field(default_factory=list)

    @property
    def palabras(self) -> int:
        return len(self.vo.split())

    def segundos(self, wps: float) -> float:
        return self.palabras / wps if self.palabras else 0.0

    @property
    def es_breadcrumb(self) -> bool:
        return "breadcrumb" in self.nombre.lower()

    @property
    def silencio_deliberado(self) -> bool:
        return not self.vo and self.tipo == "tarjeta"

    @property
    def palabras_ancla(self) -> int:
        return len([t for t in self.texto.split() if t not in SEPARADORES_ANCLA])


def parsear(md: str) -> tuple[float | None, list[Escena]]:
    objetivo = None
    m = OBJETIVO_RE.search(md)
    if m:
        objetivo = int(m.group(1)) * 60 + int(m.group(2))

    escenas: list[Escena] = []
    actual: Escena | None = None
    campo_abierto: str | None = None
    for linea in md.splitlines():
        me = ESCENA_RE.match(linea)
        if me:
            actual = Escena(id=me.group(1), nombre=me.group(2))
            escenas.append(actual)
            campo_abierto = None
            continue
        if actual is None:
            continue
        mc = CAMPO_RE.match(linea)
        if mc:
            campo_abierto = mc.group(1)
            valor = mc.group(2).strip()
            if campo_abierto == "VO":
                actual.vo = "" if valor in SIN_VALOR else valor
            elif campo_abierto == "TIPO":
                actual.tipo = valor
            elif campo_abierto == "FUENTE":
                actual.fuente = valor
            elif campo_abierto == "TEXTO":
                actual.texto = valor
            continue
        if campo_abierto == "VO" and linea.strip():
            actual.vo = f"{actual.vo} {linea.strip()}".strip()
        elif not linea.strip():
            campo_abierto = None
    return objetivo, escenas


def analizar(escenas: list[Escena], wps: float) -> list[str]:
    """Rellena escena.avisos y devuelve avisos globales."""
    globales: list[str] = []
    cursor = 0.0
    ultimo_breadcrumb = 0.0
    for e in escenas:
        if not e.vo and not e.silencio_deliberado:
            e.avisos.append("sin VO (usa '**VO:** —' en una tarjeta si el silencio es deliberado)")
        if e.tipo not in TIPOS:
            e.avisos.append(f"TIPO inválido o ausente: '{e.tipo}'")
        for oracion in re.split(r"(?<=[.!?…])\s+", e.vo):
            n = len(oracion.split())
            if n > MAX_PALABRAS_ORACION:
                e.avisos.append(f"oración de {n} palabras (> {MAX_PALABRAS_ORACION})")
        if re.search(r"\d", e.vo):
            e.avisos.append("dígitos en el VO: escríbelos en palabras")
        if re.search(r"[%$€]", e.vo):
            e.avisos.append("símbolo %/$ en el VO: escribe 'por ciento' / 'dólares'")
        siglas = sorted(set(SIGLA_RE.findall(e.vo)))
        if siglas:
            e.avisos.append(f"siglas en el VO: {', '.join(siglas)}")
        if e.tipo in TIPOS_CON_CIFRA and e.fuente in SIN_VALOR:
            e.avisos.append(f"escena de dato sin FUENTE (usa [Fn] o '{FUENTE_ILUSTRATIVA}')")
        # Una tarjeta ES el texto (título de capítulo, frase doctrina); el límite de
        # ancla aplica al texto que acompaña a un gráfico, mapa o b-roll.
        if e.tipo != "tarjeta" and e.palabras_ancla > 5:
            e.avisos.append("TEXTO ancla de más de 5 palabras")

        cursor += e.segundos(wps)
        if e.es_breadcrumb or "cierre" in e.nombre.lower():
            ultimo_breadcrumb = cursor
        elif cursor - ultimo_breadcrumb > MAX_SEG_SIN_BREADCRUMB:
            globales.append(
                f"{e.id}: {cursor - ultimo_breadcrumb:.0f} s sin breadcrumb (> {MAX_SEG_SIN_BREADCRUMB:.0f} s)"
            )
            ultimo_breadcrumb = cursor
    return globales


def fmt(seg: float) -> str:
    return f"{int(seg // 60)}:{int(seg % 60):02d}"


def reporte(objetivo: float | None, escenas: list[Escena], wps: float) -> tuple[str, bool]:
    globales = analizar(escenas, wps)
    lineas = [f"{'id':<5} {'pal':>4} {'seg':>6} {'acum':>6}  tipo        nombre"]
    acum = 0.0
    rojo = False
    for e in escenas:
        s = e.segundos(wps)
        acum += s
        lineas.append(f"{e.id:<5} {e.palabras:>4} {s:>6.1f} {fmt(acum):>6}  {e.tipo:<11} {e.nombre}")
        for a in e.avisos:
            rojo = True
            lineas.append(f"      ! {a}")
    total_pal = sum(e.palabras for e in escenas)
    lineas.append("")
    lineas.append(f"Total: {total_pal} palabras → {fmt(total_pal / wps)} a {wps} pal/s efectivas "
                  f"(solo habla, sin pausas: {fmt(total_pal / 3.0)}–{fmt(total_pal / 2.5)})")
    if objetivo:
        desvio = (total_pal / wps - objetivo) / objetivo
        marca = "OK" if abs(desvio) <= TOLERANCIA_TOTAL else "FUERA"
        if marca == "FUERA":
            rojo = True
        lineas.append(f"Objetivo: {fmt(objetivo)} · desvío {desvio:+.0%} · {marca}")
    else:
        lineas.append("Objetivo: no declarado (**Duración objetivo:** mm:ss)")
    for g in globales:
        rojo = True
        lineas.append(f"! {g}")
    return "\n".join(lineas), rojo


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("guion", type=Path)
    ap.add_argument("--wps", type=float, default=2.2)
    args = ap.parse_args()
    objetivo, escenas = parsear(args.guion.read_text(encoding="utf-8"))
    if not escenas:
        print("No se encontraron escenas '### Enn · …'", file=sys.stderr)
        return 2
    texto, rojo = reporte(objetivo, escenas, args.wps)
    print(texto)
    return 1 if rojo else 0


if __name__ == "__main__":
    sys.exit(main())
