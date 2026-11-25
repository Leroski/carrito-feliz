// Vista previa de montos en el front (D4). El valor oficial lo calcula la BD
// en public.calcular_impuesto(); este archivo replica la misma regla.

/** Tasa fija del 15 % (D5), expresada en puntos porcentuales enteros. */
export const TASA_IMPUESTO_PORCENTAJE = 15;

/** round(neto × 0,15) con redondeo half-up, usando solo enteros (D2, D3). */
export function calcularImpuesto(neto: number): number {
  if (!Number.isInteger(neto) || neto < 0) {
    throw new Error("El neto debe ser un entero CLP no negativo");
  }
  return Math.floor((neto * TASA_IMPUESTO_PORCENTAJE + 50) / 100);
}

export type LineaMonto = { precio: number; cantidad: number };

export function calcularTotales(lineas: LineaMonto[]) {
  const neto = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  const impuesto = calcularImpuesto(neto);
  return { neto, impuesto, total: neto + impuesto };
}

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(monto: number): string {
  return clp.format(monto);
}
