import { formatCLP, TASA_IMPUESTO_PORCENTAJE } from "@/lib/montos";
import type { Boleta, BoletaItem } from "@/lib/tipos";
import { formatFecha } from "./formato";

// CU4.2: productos, neto, impuesto y total. Se reutiliza en la vista PDF.
export function DetalleBoleta({ boleta }: { boleta: Boleta & { items: BoletaItem[] } }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">
          {boleta.tipo === "boleta" ? "Boleta" : "Factura"} N° {boleta.folio}
        </h1>
        <span className="text-stone-500">{formatFecha(boleta.created_at)}</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left">
          <thead className="border-b border-stone-200 text-sm text-stone-500">
            <tr>
              <th className="py-2">Producto</th>
              <th className="py-2 text-right">Precio unit.</th>
              <th className="py-2 text-center">Cant.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {boleta.items.map((i) => (
              <tr key={i.id} className="border-b border-stone-100">
                <td className="py-2">{i.nombre}</td>
                <td className="py-2 text-right">{formatCLP(i.precio_unitario)}</td>
                <td className="py-2 text-center">{i.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="mt-4 ml-auto grid max-w-xs grid-cols-2 gap-y-1">
        <dt className="text-stone-600">Neto</dt>
        <dd className="text-right" data-testid="neto">{formatCLP(boleta.neto)}</dd>
        <dt className="text-stone-600">Impuesto ({TASA_IMPUESTO_PORCENTAJE} %)</dt>
        <dd className="text-right" data-testid="impuesto">{formatCLP(boleta.impuesto)}</dd>
        <dt className="border-t border-stone-200 pt-1 font-bold">Total</dt>
        <dd className="border-t border-stone-200 pt-1 text-right font-bold" data-testid="total">{formatCLP(boleta.total)}</dd>
      </dl>
    </section>
  );
}
