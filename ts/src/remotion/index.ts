// Entry de Remotion (ADR-0009): registra el Root. Usar con:
//   pnpm studio    → abre Remotion Studio
//   pnpm render    → renderiza la composición
import { registerRoot } from 'remotion';

import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
