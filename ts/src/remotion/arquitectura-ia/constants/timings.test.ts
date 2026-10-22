import { describe, expect, it } from 'vitest';

import { FPS, OVERLAP, SCENES, TOTAL_FRAMES, sceneWindow } from './timings';

describe('timings', () => {
  it('suma exactamente 60 s a 30 fps', () => {
    expect(FPS).toBe(30);
    expect(TOTAL_FRAMES).toBe(1800);
  });

  it('declara las 8 escenas en orden', () => {
    expect(SCENES.map((s) => s.id)).toEqual([
      'intro',
      'astro',
      'next',
      'tanstack',
      'multistack',
      'latency',
      'criteria',
      'outro',
    ]);
  });

  it('cada escena empieza donde termina la anterior', () => {
    let cursor = 0;
    for (const s of SCENES) {
      expect(sceneWindow(s.id).from).toBe(cursor);
      cursor += s.duration;
    }
  });

  it('solapa la escena con la siguiente, salvo la última', () => {
    expect(sceneWindow('intro').duration).toBe(SCENES[0]!.duration + OVERLAP);
    expect(sceneWindow('outro').duration).toBe(SCENES[7]!.duration);
  });
});
