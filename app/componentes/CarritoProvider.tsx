"use client";

// El carrito vive solo en memoria del navegador (D10): al recargar se vacía.
import { createContext, useContext, useMemo, useState } from "react";
import { calcularTotales } from "@/lib/montos";

export type LineaCarrito = {
  productoId: number;
  nombre: string;
  precio: number; // precio mostrado; la BD usa el vigente al generar la boleta
  cantidad: number;
};

type CarritoCtx = {
  lineas: LineaCarrito[];
  unidades: number;
  totales: { neto: number; impuesto: number; total: number };
  agregar: (p: { id: number; nombre: string; precio: number }) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
};

const Contexto = createContext<CarritoCtx | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);

  const valor = useMemo<CarritoCtx>(
    () => ({
      lineas,
      unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
      totales: calcularTotales(lineas),
      agregar: (p) =>
        setLineas((actual) =>
          actual.some((l) => l.productoId === p.id)
            ? actual.map((l) => (l.productoId === p.id ? { ...l, cantidad: l.cantidad + 1 } : l)) // CU2.1
            : [...actual, { productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }],
        ),
      cambiarCantidad: (productoId, cantidad) =>
        setLineas((actual) =>
          cantidad <= 0
            ? actual.filter((l) => l.productoId !== productoId) // CU2.3
            : actual.map((l) => (l.productoId === productoId ? { ...l, cantidad } : l)),
        ),
      quitar: (productoId) => setLineas((actual) => actual.filter((l) => l.productoId !== productoId)),
      vaciar: () => setLineas([]),
    }),
    [lineas],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
