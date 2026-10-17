import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { medir } from './estudio.mjs';
import { cortesTomaUnica, esAudioSilencioso, decidirVoz, filtroRitmo, firmaVoz, idsDeAssets, narracion, palabrasDeAlineacion, parsearOrigen, pedidoVoz, precondicionesRender, siguienteNombre, textoVoz, tipoDeArchivo } from './estudio.mjs';

const config = { proveedor: 'openai', modelo: 'gpt-4o-mini-tts', voz: 'coral', instruccion: 'chileno neutro' };
const escena = { id: 'portal', locucion: 'Hola' };
const propia = { asset: 'p/voz/portal', segundos: 3, texto: 'Hola', config: firmaVoz(config) };

describe('decidirVoz', () => {
  it('mantiene la voz propia con el mismo texto y la misma configuración', () => {
    expect(decidirVoz(propia, escena, 'p', config)).toBe('mantener');
  });
  it('regenera si cambió el texto', () => {
    expect(decidirVoz(propia, { ...escena, locucion: 'Chao' }, 'p', config)).toBe('regenerar');
  });
  it('regenera si cambió la voz o la instrucción', () => {
    expect(decidirVoz(propia, escena, 'p', { ...config, voz: 'nova' })).toBe('regenerar');
  });
  it('regenera una entrada sin firma de configuración (no se sabe con qué voz se hizo)', () => {
    const { config: _sinFirma, ...sinConfig } = propia;
    expect(decidirVoz(sinConfig, escena, 'p', config)).toBe('regenerar');
  });
  it('regenera la voz heredada de otro proyecto (clon)', () => {
    expect(decidirVoz({ ...propia, asset: 'origen/voz/portal' }, escena, 'p', config)).toBe('regenerar');
  });
  it('quita la voz de una escena borrada o sin locución', () => {
    expect(decidirVoz(propia, undefined, 'p', config)).toBe('quitar');
    expect(decidirVoz(propia, { ...escena, locucion: '' }, 'p', config)).toBe('quitar');
  });
});

describe('parsearOrigen', () => {
  it('conserva los «=» del valor', () => {
    expect(parsearOrigen('url=https://app.x.com/perfil?id=42')).toEqual(['url', 'https://app.x.com/perfil?id=42']);
  });
});

describe('siguienteNombre (tomas nuevas, assets inmutables)', () => {
  const manifiesto = (ids) => {
    const ruta = join(mkdtempSync(join(tmpdir(), 'estudio-')), 'assets.json');
    writeFileSync(ruta, JSON.stringify({ assets: ids.map((id) => ({ id })) }));
    return ruta;
  };
  it('usa el nombre base si está libre', () => {
    expect(siguienteNombre(manifiesto(['p/otra']), 'voz/portal')).toBe('voz/portal');
  });
  it('pasa a la siguiente toma libre sin pisar ninguna', () => {
    expect(siguienteNombre(manifiesto(['p/voz/portal']), 'voz/portal')).toBe('voz/portal@2');
    expect(siguienteNombre(manifiesto(['p/voz/portal', 'p/voz/portal@2']), 'voz/portal')).toBe('voz/portal@3');
  });
});

describe('precondicionesRender (antes del primer frame)', () => {
  const p = { id: 'p', formatos: ['horizontal', 'vertical'], poster: { captura: 'p/x' }, voz: config };
  const guion = { escenas: [escena] };
  const vozOk = { portal: propia };
  const pVoz = { ...p, id: 'p' };
  it('un proyecto listo no tiene problemas', () => {
    expect(precondicionesRender(pVoz, guion, vozOk, [])).toEqual([]);
  });
  it('rechaza un --solo desconocido o fuera de los formatos', () => {
    expect(precondicionesRender(pVoz, guion, vozOk, ['--solo', 'horizonal']).join()).toMatch(/--solo horizonal/);
    expect(precondicionesRender({ ...pVoz, formatos: ['horizontal'] }, guion, vozOk, ['--solo', 'vertical'])).toHaveLength(1);
  });
  it('rechaza --correo sin el horizontal en la misma corrida', () => {
    expect(precondicionesRender(pVoz, guion, vozOk, ['--solo', 'vertical', '--correo']).join()).toMatch(/--correo/);
  });
  it('rechaza el render si falta la captura del poster', () => {
    expect(precondicionesRender({ ...pVoz, poster: { captura: '' } }, guion, vozOk, []).join()).toMatch(/poster/);
  });
  it('rechaza el render si la voz no está al día con el guion', () => {
    const cambiado = { escenas: [{ ...escena, locucion: 'Texto nuevo' }] };
    expect(precondicionesRender(pVoz, cambiado, vozOk, []).join()).toMatch(/voz no está al día en: portal/);
  });
});

describe('idsDeAssets', () => {
  it('toma ids solo de los campos de asset, no de textos, URLs ni modelos', () => {
    const datos = {
      voz: { modelo: 'jpgallegoar/F5-Spanish' },
      poster: { titulo: 'Soporte 24/7', captura: 'p/perfil' },
      escenas: [{ titulo: 'correo/whatsapp', props: { url: 'localhost/panel', captura: 'p/portal', mensajes: [{ captura: 'p/wa@2' }] } }],
      gancho: { asset: 'p/voz/gancho' },
    };
    expect(idsDeAssets(datos).sort()).toEqual(['p/perfil', 'p/portal', 'p/voz/gancho', 'p/wa@2']);
  });
});

describe('ajuste de ritmo de la voz', () => {
  it('sin ajuste declarado, la firma no cambia (proyectos previos siguen vigentes) y no hay filtro', () => {
    expect(firmaVoz(config)).toBe(firmaVoz({ ...config }));
    expect(filtroRitmo(config)).toBeNull();
  });
  it('con ajuste, cambia la firma (fuerza regenerar) y el filtro limita pausas y aplica tempo', () => {
    const ajustada = { ...config, tempo: 1.05, pausaMaxima: 0.35 };
    expect(firmaVoz(ajustada)).not.toBe(firmaVoz(config));
    expect(filtroRitmo(ajustada)).toMatch(/stop_duration=0\.35.*atempo=1\.05/);
  });
});

describe('tipoDeArchivo', () => {
  it('reconoce fuentes y datos además de imagen y audio', () => {
    expect(tipoDeArchivo('a/Bungee.ttf')).toBe('fuente');
    expect(tipoDeArchivo('a/b.OTF')).toBe('fuente');
    expect(tipoDeArchivo('a/baile.json')).toBe('datos');
    expect(tipoDeArchivo('a/foto.PNG')).toBe('imagen');
    expect(tipoDeArchivo('a/pista.mp3')).toBe('audio');
  });
});

describe('pedidoVoz (un pedido de TTS por proveedor)', () => {
  const eleven = { proveedor: 'elevenlabs', modelo: 'eleven_v4', voz: 'voz-de-ejemplo', instruccion: '', ajustes: { stability: 0.75, similarity_boost: 0.8 } };
  it('OpenAI: pide wav al endpoint de speech con la instrucción', () => {
    const p = pedidoVoz(config, 'Hola', { OPENAI_API_KEY: 'k' });
    expect(p.url).toBe('https://api.openai.com/v1/audio/speech');
    expect(p.formato).toBe('wav');
    expect(JSON.parse(p.init.body)).toMatchObject({ model: 'gpt-4o-mini-tts', voice: 'coral', input: 'Hola', instructions: 'chileno neutro' });
    expect(p.init.headers.Authorization).toBe('Bearer k');
  });
  it('ElevenLabs: pide la toma con marcas de tiempo, con su modelo, idioma, ajustes y semilla', () => {
    const p = pedidoVoz({ ...eleven, semilla: 7 }, 'Hola', { ELEVENLABS_API_KEY: 'e' });
    expect(p.url).toBe('https://api.elevenlabs.io/v1/text-to-speech/voz-de-ejemplo/with-timestamps?output_format=mp3_44100_192');
    expect(p.formato).toBe('json');
    expect(p.init.headers['xi-api-key']).toBe('e');
    expect(JSON.parse(p.init.body)).toEqual({ text: 'Hola', model_id: 'eleven_v4', language_code: 'es', voice_settings: eleven.ajustes, seed: 7 });
  });
  it('falla con el nombre de la clave que falta, o con un proveedor desconocido', () => {
    expect(() => pedidoVoz(eleven, 'Hola', {})).toThrow(/ELEVENLABS_API_KEY/);
    expect(() => pedidoVoz(config, 'Hola', {})).toThrow(/OPENAI_API_KEY/);
    expect(() => pedidoVoz({ ...config, proveedor: 'otro' }, 'Hola', {})).toThrow(/no soportado: otro/);
  });
  it('ElevenLabs rechaza el ajuste de ritmo: movería el audio y desincronizaría las palabras', () => {
    expect(() => pedidoVoz({ ...eleven, pausaMaxima: 0.4 }, 'Hola', { ELEVENLABS_API_KEY: 'e' })).toThrow(/ritmo/);
  });
  it('los ajustes y la semilla entran en la firma solo si están declarados (cambiarlos obliga a regenerar)', () => {
    expect(firmaVoz(eleven)).not.toBe(firmaVoz({ ...eleven, ajustes: { ...eleven.ajustes, stability: 0.5 } }));
    expect(firmaVoz(eleven)).not.toBe(firmaVoz({ ...eleven, semilla: 3 }));
    const { ajustes: _sin, ...sinAjustes } = eleven;
    expect(firmaVoz(sinAjustes)).toBe(firmaVoz({ ...sinAjustes }));
  });
});

describe('textoVoz (lo que se le manda al TTS)', () => {
  it('antepone la dirección de actuación a la locución', () => {
    expect(textoVoz({ locucion: 'Hola.', direccion: '[warm]' })).toBe('[warm] Hola.');
    expect(textoVoz({ locucion: 'Hola.' })).toBe('Hola.');
  });
  it('cambiar la dirección obliga a regenerar la escena', () => {
    const vigente = { ...propia, texto: 'Hola' };
    expect(decidirVoz(vigente, { ...escena, direccion: '[warm]' }, 'p', config)).toBe('regenerar');
  });
});

describe('narración de toma única', () => {
  it('une las escenas con locución y recuerda dónde empieza y termina cada una', () => {
    const n = narracion([
      { id: 'a', locucion: 'Hola.', direccion: '[warm]' },
      { id: 'mudo', locucion: '' },
      { id: 'b', locucion: 'Chao.' },
    ]);
    expect(n.texto).toBe('[warm] Hola. Chao.');
    expect(n.rangos).toEqual([
      { id: 'a', desde: 0, hasta: 12 },
      { id: 'b', desde: 13, hasta: 18 },
    ]);
  });
});

const alinear = (texto, paso = 0.1) => ({
  characters: [...texto],
  character_start_times_seconds: [...texto].map((_, i) => i * paso),
  character_end_times_seconds: [...texto].map((_, i) => (i + 1) * paso),
});

describe('palabrasDeAlineacion', () => {
  it('agrupa caracteres en palabras, sin las etiquetas entre corchetes, relativas al origen', () => {
    const al = alinear('[warm] Hola, soy Ana.');
    expect(palabrasDeAlineacion(al, 0, 21, 0.5)).toEqual([
      { texto: 'Hola,', inicio: 0.2, fin: 0.7 },
      { texto: 'soy', inicio: 0.8, fin: 1.1 },
      { texto: 'Ana.', inicio: 1.2, fin: 1.6 },
    ]);
  });
});

describe('cortesTomaUnica', () => {
  it('corta cada escena a mitad del silencio que la separa de la vecina', () => {
    const al = alinear('Hola. Chao.');
    expect(cortesTomaUnica(al, [{ id: 'a', desde: 0, hasta: 5 }, { id: 'b', desde: 6, hasta: 11 }], 1.5)).toEqual([
      { id: 'a', inicio: 0, fin: 0.55 },
      { id: 'b', inicio: 0.55, fin: 1.5 },
    ]);
  });
});


describe('esAudioSilencioso (video sin voz ni música)', () => {
  it('una pista silenciosa mide -inf y no se normaliza', () => {
    expect(esAudioSilencioso({ input_i: '-inf' })).toBe(true);
  });
  it('una pista con sonido mide un nivel finito y sí se normaliza', () => {
    expect(esAudioSilencioso({ input_i: '-23.40' })).toBe(false);
  });
});

describe('assets de video (grabaciones propias)', () => {
  it('los contenedores de video se registran con tipo video', () => {
    expect(tipoDeArchivo('toma.mp4')).toBe('video');
    expect(tipoDeArchivo('toma.MOV')).toBe('video');
    expect(tipoDeArchivo('toma.webm')).toBe('video');
  });
  it('medir lee ancho, alto y segundos de un video', () => {
    const carpeta = mkdtempSync(join(tmpdir(), 'estudio-video-'));
    const archivo = join(carpeta, 'prueba.mp4');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=30:duration=2', '-pix_fmt', 'yuv420p', archivo]);
    expect(medir(archivo)).toEqual({ tipo: 'video', ancho: 320, alto: 240, segundos: 2 });
  });
});
