import presupuesto_vo as p

GUION = """# EP01 — Prueba

**Serie:** X · **Duración objetivo:** 1:00 · **Tesis:** t

## Escenas

### E01 · cold open · ancla  [0:00-0:12]
**VO:** Esta es una cama de hospital en una ciudad cualquiera. Nadie sabe cuántas como esta hay en el país.
**VISUAL:** b-roll
**TEXTO:** —
**TIPO:** broll
**FUENTE:** —

### E02 · dato · camas · breadcrumb
**VO:** Según la OPS, hay 1.220 camas afectadas, un 5% del total, y esta oración es larguísima porque sigue y sigue y sigue y sigue y sigue y sigue y sigue y sigue.
**TIPO:** dato
**FUENTE:** —

### E03 · cierre
**VO:** Primera línea del VO
que continúa en la siguiente.
**TIPO:** tarjeta
**FUENTE:** —
"""


def test_parsea_objetivo_y_escenas():
    objetivo, escenas = p.parsear(GUION)
    assert objetivo == 60
    assert [e.id for e in escenas] == ["E01", "E02", "E03"]
    assert escenas[0].tipo == "broll"
    assert escenas[0].palabras == 17


def test_vo_multilinea_se_une():
    _, escenas = p.parsear(GUION)
    assert escenas[2].vo == "Primera línea del VO que continúa en la siguiente."


def test_detecta_reglas_tts_y_fuente():
    _, escenas = p.parsear(GUION)
    p.analizar(escenas, 2.75)
    avisos = " | ".join(escenas[1].avisos)
    assert "dígitos" in avisos
    assert "%/$" in avisos
    assert "OPS" in avisos
    assert "sin FUENTE" in avisos
    assert "> 22" in avisos
    assert escenas[0].avisos == []


def test_breadcrumb_gap_y_total():
    vo_largo = " ".join(["palabra"] * 450)  # ~164 s a 2.75 pal/s
    md = GUION + f"\n### E04 · largo\n**VO:** {vo_largo}\n**TIPO:** tarjeta\n**FUENTE:** —\n"
    objetivo, escenas = p.parsear(md)
    texto, rojo = p.reporte(objetivo, escenas, 2.75)
    assert rojo
    assert "sin breadcrumb" in texto
    assert "FUERA" in texto


def test_silencio_deliberado_ilustrativo_y_separadores_de_ancla():
    md = """**Duración objetivo:** 0:05

### E01 · título
**VO:** —
**TIPO:** tarjeta
**FUENTE:** —

### E02 · dos municipios
**VO:** Esta es una cama vacía. Nadie sabe cuántas hay en el país. Nadie.
**TEXTO:** A · 18 min · 70 %
**TIPO:** ficha
**FUENTE:** ilustrativo
"""
    objetivo, escenas = p.parsear(md)
    texto, rojo = p.reporte(objetivo, escenas, 2.75)
    assert not rojo, texto
    assert escenas[1].palabras_ancla == 5


def test_guion_limpio_no_es_rojo():
    md = """**Duración objetivo:** 0:05

### E01 · ancla
**VO:** Esta es una cama vacía. Nadie sabe cuántas hay en el país. Nadie.
**TIPO:** broll
**FUENTE:** —
"""
    objetivo, escenas = p.parsear(md)
    texto, rojo = p.reporte(objetivo, escenas, 2.75)
    assert not rojo, texto
