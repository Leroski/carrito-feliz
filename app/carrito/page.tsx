"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCarrito } from "@/app/componentes/CarritoProvider";
import { generarBoleta } from "@/app/boletas/acciones";
import { formatCLP, TASA_IMPUESTO_PORCENTAJE } from "@/lib/montos";

// CU2: ver, modificar y quitar productos. CU3: generar boleta.
export default function CarritoPage() {
  const { lineas, totales, cambiarCantidad, quitar, vaciar } = useCarrito();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function onGenerar() {
    setError(null);
    startTransition(async () => {
      const r = await generarBoleta(lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })));
      if ("error" in r) {
        setError(r.error);
        return;
      }
      vaciar(); // CU3.2
      router.push(`/boletas/${r.folio}`);
    });
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>

      {lineas.length === 0 ? (
        <p className="text-stone-500">
          El carrito está vacío. <Link href="/" className="text-emerald-700 underline">Ir al catálogo</Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[32rem] text-left">
            <thead className="border-b border-stone-200 text-sm text-stone-500">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l) => (
                <tr key={l.productoId} className="border-b border-stone-100">
                  <td className="p-3 font-medium">{l.nombre}</td>
                  <td className="p-3 text-right">{formatCLP(l.precio)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" aria-label={`Restar una unidad de ${l.nombre}`} onClick={() => cambiarCantidad(l.productoId, l.cantidad - 1)} className="h-7 w-7 rounded border border-stone-300 hover:bg-stone-100">−</button>
                      <span className="w-6 text-center">{l.cantidad}</span>
                      <button type="button" aria-label={`Sumar una unidad de ${l.nombre}`} onClick={() => cambiarCantidad(l.productoId, l.cantidad + 1)} className="h-7 w-7 rounded border border-stone-300 hover:bg-stone-100">+</button>
                    </div>
                  </td>
                  <td className="p-3 text-right">{formatCLP(l.precio * l.cantidad)}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => quitar(l.productoId)} className="text-sm text-red-600 hover:underline" aria-label={`Quitar ${l.nombre} del carrito`}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dl className="mt-6 ml-auto grid max-w-xs grid-cols-2 gap-y-1">
        <dt className="text-stone-600">Neto</dt>
        <dd className="text-right">{formatCLP(totales.neto)}</dd>
        <dt className="text-stone-600">Impuesto ({TASA_IMPUESTO_PORCENTAJE} %)</dt>
        <dd className="text-right">{formatCLP(totales.impuesto)}</dd>
        <dt className="border-t border-stone-200 pt-1 font-bold">Total</dt>
        <dd className="border-t border-stone-200 pt-1 text-right font-bold">{formatCLP(totales.total)}</dd>
      </dl>
      <p className="mt-1 text-right text-xs text-stone-500">Estimado. Los montos finales los calcula el sistema al generar la boleta.</p>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onGenerar}
          disabled={lineas.length === 0 || pendiente} /* CU3.1 */
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pendiente ? "Generando…" : "Generar boleta"}
        </button>
      </div>
    </>
  );
}
