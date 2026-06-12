// Configuración de Remotion (ADR-0009). El entry vive en src/remotion/index.ts.
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
