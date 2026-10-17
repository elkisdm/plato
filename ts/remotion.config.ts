// Configuración de Remotion (ADR-0009). El entry vive en src/remotion/index.ts.
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL por GPU (ANGLE sobre Metal): las escenas con three.js (cromo 3D, bloom) lo necesitan.
Config.setChromiumOpenGlRenderer('angle');
