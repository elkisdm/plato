import { centro, corteDe, zonaDe, type Asset, type Zona } from '../../assets';
import type { TramoPuntero } from '../../kit/Puntero';
import type { ResaltadoConfig } from '../../kit/Resaltado';
import type { AssetServido } from '../../proyecto';

/** Resuelve «nombre» o «nombre#n» contra las zonas del manifiesto del asset. */
export const zonaRef = (a: Asset, ref: string): Zona => {
  const [nombre = '', n = '0'] = ref.split('#');
  return zonaDe(a, nombre, Number(n));
};

type ResaltadoDatos = { zona: string; inicio: number; fin?: number };
type PunteroDatos = {
  zona: string;
  desde: number;
  en: number;
  origen: { x: number; y: number };
  dx: number;
  dy: number;
  clic: boolean;
};

export const resaltadosDe = (a: Asset, rs: ResaltadoDatos[]): ResaltadoConfig[] =>
  rs.map((r) => ({ zona: zonaRef(a, r.zona), inicio: r.inicio, fin: r.fin }));

/** Dos tramos: desde el origen hasta la zona (centro desplazado dx/dy), con clic al llegar. */
export const punteroDe = (a: Asset, p: PunteroDatos | undefined): TramoPuntero[] | undefined => {
  if (!p) return undefined;
  const c = centro(zonaRef(a, p.zona));
  return [
    { frame: p.desde, x: p.origen.x, y: p.origen.y },
    { frame: p.en, x: c.x + p.dx, y: c.y + p.dy, clic: p.clic },
  ];
};

type MensajeDatos = {
  captura: string;
  inicio: number;
  desde: string;
  hasta: string;
  saliente: boolean;
  resaltados: ResaltadoDatos[];
  puntero?: PunteroDatos;
};

/** Un mensaje del guion listo para `BurbujaEntrando`: la franja entre dos cortes de su captura. */
export const mensajeDe = (servir: (id: string) => AssetServido, m: MensajeDatos) => {
  const captura = servir(m.captura);
  return {
    captura,
    desde: corteDe(captura, m.desde),
    hasta: corteDe(captura, m.hasta),
    inicio: m.inicio,
    saliente: m.saliente,
    resaltados: resaltadosDe(captura, m.resaltados),
    puntero: punteroDe(captura, m.puntero),
  };
};
