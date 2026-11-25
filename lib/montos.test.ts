import { describe, expect, it } from "vitest";
import { calcularImpuesto, calcularTotales } from "./montos";

// Mismos casos que supabase/tests/database/carrito.test.sql (CU5.3)
describe("calcularImpuesto", () => {
  it.each([
    [0, 0],
    [1, 0],
    [3, 0],
    [10, 2],
    [1990, 299],
    [5070, 761],
  ])("impuesto(%i) = %i", (neto, esperado) => {
    expect(calcularImpuesto(neto)).toBe(esperado);
  });

  it("rechaza montos no enteros o negativos", () => {
    expect(() => calcularImpuesto(10.5)).toThrow();
    expect(() => calcularImpuesto(-1)).toThrow();
  });
});

describe("calcularTotales", () => {
  it("CU3.4: 1 Leche + 2 Pan", () => {
    expect(
      calcularTotales([
        { precio: 1090, cantidad: 1 },
        { precio: 1990, cantidad: 2 },
      ]),
    ).toEqual({ neto: 5070, impuesto: 761, total: 5831 });
  });

  it("carrito vacío da cero", () => {
    expect(calcularTotales([])).toEqual({ neto: 0, impuesto: 0, total: 0 });
  });
});
