import { describe, it, expect } from 'vitest';
import { extractPresets } from './presets';
import type { VideoSpec } from './types';

function specFixture(overrides: Partial<VideoSpec> = {}): VideoSpec {
  return {
    specVersion: '0.2.0',
    source: {
      id: 'vid-1',
      filename: 'v.mp4',
      durationMs: 176376,
      fps: 24,
      width: 720,
      height: 1280,
      codec: 'h264',
    },
    meta: { analyzedAt: '2026-06-12', analyzerVersion: '0.1.0' },
    shots: [{ id: 'shot_001', startMs: 0, endMs: 1000, durationMs: 1000 }],
    ...overrides,
  } as unknown as VideoSpec;
}

describe('extractPresets', () => {
  it('toma metadata del source', () => {
    const p = extractPresets(specFixture());
    expect(p.videoId).toBe('vid-1');
    expect(p.fps).toBe(24);
    expect(p.width).toBe(720);
    expect(p.durationMs).toBe(176376);
  });

  it('deriva el caption preset de style.typography.talkingHead', () => {
    const p = extractPresets(
      specFixture({
        style: {
          pacing: { cutsPerMin: 21, avgShotMs: 2000, medianShotMs: 2000 },
          qualitativeSummary: 'x',
          typography: {
            talkingHead: {
              family: 'rounded-sans',
              color: '#FFF6E0',
              highlight: '#E8B84B glow',
              casing: 'lowercase',
            },
          },
        },
      } as Partial<VideoSpec>),
    );
    expect(p.caption.fontFamily).toContain('rounded');
    expect(p.caption.highlightColor).toContain('E8B84B');
    expect(p.caption.casing).toBe('lowercase');
  });

  it('deriva colorWorlds y transitionVocabulary del style', () => {
    const p = extractPresets(
      specFixture({
        style: {
          pacing: { cutsPerMin: 21, avgShotMs: 2000, medianShotMs: 2000 },
          qualitativeSummary: 'x',
          transitionVocabulary: { cut: 49, flash_cut: 12, dissolve: 1 },
          colorGrade: {
            talkingHead: { temperature: 'warm', saturation: 'high', look: 'low-key' },
            collage: { temperature: 'neutral', saturation: 'low' },
          },
        },
      } as Partial<VideoSpec>),
    );
    expect(p.transitionVocabulary.flash_cut).toBe(12);
    expect(p.colorWorlds.talkingHead?.temperature).toBe('warm');
    expect(p.colorWorlds.collage?.saturation).toBe('low');
  });

  it('usa defaults sensatos cuando faltan capas (spec CV-only)', () => {
    const p = extractPresets(specFixture());
    expect(p.caption.fontFamily).toBeTruthy();
    expect(p.caption.highlightColor).toMatch(/^#/);
    expect(p.colorWorlds).toEqual({});
    expect(p.transitionVocabulary).toEqual({});
  });

  it('cae a la primera caption real si no hay typography', () => {
    const p = extractPresets(
      specFixture({
        captions: [
          {
            id: 'cap_001',
            text: 'hola',
            startMs: 0,
            endMs: 500,
            style: {
              fontFamilyGuess: 'rounded-sans',
              color: '#FFFFFF',
              highlightColor: '#E8B84B',
              casing: 'lowercase',
              animation: 'fade_in_word',
            },
            source: 'vision',
            confidence: 0.9,
          },
        ],
      } as Partial<VideoSpec>),
    );
    expect(p.caption.fontFamily).toBe('rounded-sans');
    expect(p.caption.animation).toBe('fade_in_word');
  });
});
