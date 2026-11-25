import Link from "next/link";
import { Suspense } from "react";
import { Cargando } from "@/app/componentes/Cargando";
import { listarBoletas } from "@/lib/datos";
import { formatCLP } from "@/lib/montos";
import { formatFecha } from "./formato";

// CU4.1: historial, de la más nueva a la más antigua
export default function BoletasPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Boletas</h1>
      <Suspense fallback={<Cargando texto="Cargando boletas…" />}>
        <ListaBoletas />
      </Suspense>
    </>
  );
}

async function ListaBoletas() {
  const boletas = await listarBoletas();
  if (boletas.length === 0) return <p className="text-stone-500">Aún no se han generado boletas.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[28rem] text-left">
        <thead className="border-b border-stone-200 text-sm text-stone-500">
          <tr>
            <th className="p-3">Folio</th>
            <th className="p-3">Fecha</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {boletas.map((b) => (
            <tr key={b.folio} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="p-3">
                <Link href={`/boletas/${b.folio}`} className="font-medium text-emerald-700 hover:underline">
                  N° {b.folio}
                </Link>
              </td>
              <td className="p-3">{formatFecha(b.created_at)}</td>
              <td className="p-3 text-right">{formatCLP(b.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
