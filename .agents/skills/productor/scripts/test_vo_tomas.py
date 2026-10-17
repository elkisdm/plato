import vo_tomas as v


def test_perfil_por_nombre():
    assert v.perfil_de_escena("· cold open · ancla", "broll") == "hook"
    assert v.perfil_de_escena("· cap1 · re-hook", "broll") == "hook"
    assert v.perfil_de_escena("· cap4 · doctrina", "tarjeta") == "aforismo"
    assert v.perfil_de_escena("· cap1 · objeción", "tarjeta") == "objecion"
    assert v.perfil_de_escena("· cap3 · matiz", "broll") == "matiz"
    assert v.perfil_de_escena("· cierre · vuelta al ancla", "broll") == "cierre"
    assert v.perfil_de_escena("· cap1 · el dinero", "dato") == "base"


def test_override_gana():
    assert v.perfil_de_escena("· cap1 · el dinero", "dato", {"E20": "revelacion"}, "E20") == "revelacion"


def test_frases_agrupa_y_no_deja_colas_cortas():
    texto = "Días después, un equipo fue hospital por hospital. Ocho establecimientos afectados. Tres con daño estructural. Mil doscientas veinte camas."
    partes = v.frases(texto)
    assert all(len(p) >= 25 for p in partes)
    assert " ".join(partes) == texto
    assert len(partes) == 2
