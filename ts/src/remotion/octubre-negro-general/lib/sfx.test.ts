import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { finLinea, aFrame } from './alineacion';
import { DURACION } from './lineaTiempo';
import {
  DIR_SFX,
  DURACION_SFX,
  EFECTOS,
  MUSICA_ARRANQUE,
  MUSICA_BASE,
  MUSICA_HABLA,
  volumenMusica,
} from './sfx';

const dirPublic = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../public');

describe('EFECTOS', () => {
  it('no está vacío y cada archivo existe en public/octubre-negro-general/sfx', () => {
    expect(EFECTOS.length).toBeGreaterThan(40);
    for (const e of EFECTOS) {
      expect(existsSync(resolve(dirPublic, DIR_SFX, e.archivo)), e.archivo).toBe(true);
    }
  });

  it('todo archivo usado tiene duración conocida', () => {
    for (const e of EFECTOS) expect(DURACION_SFX[e.archivo], e.archivo).toBeGreaterThan(0);
  });

  it('frames enteros, ordenados y dentro de DURACION', () => {
    EFECTOS.forEach((e, i) => {
      expect(Number.isInteger(e.frame)).toBe(true);
      expect(e.frame).toBeGreaterThanOrEqual(0);
      expect(e.frame).toBeLessThan(DURACION);
      if (i > 0) expect(e.frame).toBeGreaterThanOrEqual(EFECTOS[i - 1]!.frame);
    });
  });

  it('volúmenes entre 0 y 1 (y dentro de 0,25–0,6)', () => {
    for (const e of EFECTOS) {
      expect(e.volumen).toBeGreaterThanOrEqual(0.25);
      expect(e.volumen).toBeLessThanOrEqual(0.6);
    }
  });

  it('ningún riser empieza en frame negativo y cada uno termina en su golpe', () => {
    const risers = EFECTOS.filter((e) => e.archivo.startsWith('riser'));
    expect(risers).toHaveLength(2);
    for (const r of risers) {
      expect(r.frame).toBeGreaterThanOrEqual(0);
      const fin = r.frame + Math.round(DURACION_SFX[r.archivo]! * 30);
      const golpe = EFECTOS.find((e) => e.frame === fin && !e.archivo.startsWith('riser'));
      expect(golpe, `golpe a ${fin}`).toBeDefined();
    }
  });

  it('no usa tipeo', () => {
    expect(EFECTOS.some((e) => e.archivo.startsWith('tipeo'))).toBe(false);
  });
});

describe('volumenMusica', () => {
  const finVoz = aFrame(finLinea(6));

  it('sube al arranque, baja mientras habla y vuelve a subir tras la voz', () => {
    expect(volumenMusica(0)).toBeCloseTo(MUSICA_ARRANQUE);
    expect(volumenMusica(60)).toBeCloseTo(MUSICA_HABLA);
    expect(volumenMusica(finVoz + 15)).toBeCloseTo(MUSICA_ARRANQUE);
  });

  it('en una pausa larga de la voz queda en la base', () => {
    expect(volumenMusica(145)).toBeGreaterThan(MUSICA_HABLA);
    expect(volumenMusica(145)).toBeLessThanOrEqual(MUSICA_BASE);
  });

  it('siempre entre 0 y 1 y se apaga al final', () => {
    for (let f = 0; f < DURACION; f += 7) {
      const v = volumenMusica(f);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(volumenMusica(DURACION - 1)).toBeLessThan(0.02);
  });
});
