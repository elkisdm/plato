/**
 * Tokens del reel "Octubre Negro, verificado": el tema de ArquitecturaIA (fondo #090D0F,
 * turquesa, Geist) más un ámbar de alerta. Ningún componente escribe un color a mano: todo sale de acá.
 * La alerta es ámbar, nunca rojo.
 */

import { SPRINGS as SPRINGS_ARQ } from '../../arquitectura-ia/constants/theme';

export { COLORS, FONTS, SPACING, TYPE } from '../../arquitectura-ia/constants/theme';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Alerta: ámbar. */
export const WARN = '#F5A524';
export const WARN_GLOW = 'rgba(245,165,36,0.32)';
export const WARN_WASH = 'rgba(245,165,36,0.08)';

/** Los springs de ArquitecturaIA más `golpe`: overshoot corto (damping 12) para el momento fuerte de cada escena. */
export const SPRINGS = { ...SPRINGS_ARQ, golpe: { damping: 12 } } as const;
