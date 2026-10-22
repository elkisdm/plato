import { describe, expect, it } from 'vitest';

import { SOUND_CUES, VO_MARKERS } from './soundCues';
import { TOTAL_FRAMES } from './timings';

describe('soundCues', () => {
  it('están ordenados y dentro del video', () => {
    const frames = SOUND_CUES.map((c) => c.frame);
    expect(frames).toEqual([...frames].sort((a, b) => a - b));
    expect(frames.every((f) => f >= 0 && f < TOTAL_FRAMES)).toBe(true);
  });

  it('hay un marker de voz por escena', () => {
    expect(VO_MARKERS).toHaveLength(8);
    expect(VO_MARKERS.every((m) => m.frame >= 0 && m.frame < TOTAL_FRAMES)).toBe(true);
  });
});
