/** Una cifra textual («8,5 %», «$1.200», «+30») separada en lo que cuenta y lo que la rodea. */
export type Cifra = {
  prefijo: string;
  sufijo: string;
  valor: number;
  decimales: number;
  /** Separa miles con punto (convención chilena). */
  miles: boolean;
  /** Separador decimal de la cifra original. */
  separadorDecimal: ',' | '.';
};

/**
 * Lee la primera cifra del texto con convención chilena (`1.200` miles, `8,5` decimales). Devuelve
 * `null` si no hay dígitos: la tarjeta lo muestra tal cual, sin contar.
 */
export const analizarCifra = (texto: string): Cifra | null => {
  const m = /^(\D*?)(\d(?:[\d.,]*\d)?)([\s\S]*)$/.exec(texto);
  if (!m) return null;
  const [, prefijo = '', numero = '', sufijo = ''] = m;
  let entero = numero;
  let decimal = '';
  let separadorDecimal: ',' | '.' = ',';
  let miles = false;
  const coma = numero.lastIndexOf(',');
  if (coma >= 0) {
    entero = numero.slice(0, coma);
    decimal = numero.slice(coma + 1);
    miles = entero.includes('.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(numero)) {
    miles = true;
  } else if (numero.includes('.')) {
    const punto = numero.lastIndexOf('.');
    entero = numero.slice(0, punto);
    decimal = numero.slice(punto + 1);
    separadorDecimal = '.';
  }
  const valor = Number(`${entero.replaceAll('.', '')}${decimal ? `.${decimal}` : ''}`);
  if (Number.isNaN(valor)) return null;
  return { prefijo, sufijo, valor, decimales: decimal.length, miles, separadorDecimal };
};

/** La cifra con su valor sustituido por `valor` (el conteo la recorre de 0 a `cifra.valor`). */
export const formatearCifra = (cifra: Cifra, valor: number): string => {
  const [entero = '0', fraccion] = valor.toFixed(cifra.decimales).split('.');
  const conMiles = cifra.miles ? entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : entero;
  return `${cifra.prefijo}${conMiles}${fraccion ? cifra.separadorDecimal + fraccion : ''}${cifra.sufijo}`;
};
