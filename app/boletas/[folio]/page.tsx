import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cargando } from "@/app/componentes/Cargando";
import { obtenerBoleta, parsearId } from "@/lib/datos";
import { DetalleBoleta } from "../DetalleBoleta";

export default function BoletaPage({ params }: PageProps<"/boletas/[folio]">) {
  return (
    <Suspense fallback={<Cargando texto="Cargando boleta…" />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ folio: string }> }) {
  const folio = parsearId((await params).folio);
  const boleta = folio ? await obtenerBoleta(folio) : null;
  if (!boleta) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/boletas" className="text-sm text-stone-500 hover:text-emerald-700">← Volver al historial</Link>
      <DetalleBoleta boleta={boleta} />
      {/* CU4.3: PDF de prueba (D13) */}
      <Link href={`/boletas/${boleta.folio}/pdf`} className="self-end rounded-lg border border-stone-300 px-4 py-2 hover:bg-stone-100">
        📄 Ver PDF
      </Link>
    </div>
  );
}
