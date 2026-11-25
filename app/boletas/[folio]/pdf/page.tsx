import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cargando } from "@/app/componentes/Cargando";
import { obtenerBoleta, parsearId } from "@/lib/datos";
import { DetalleBoleta } from "../../DetalleBoleta";
import { BotonImprimir } from "./BotonImprimir";

// D13: PDF de prueba. Vista imprimible; el navegador la guarda como PDF.
export default function BoletaPdfPage({ params }: PageProps<"/boletas/[folio]/pdf">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ folio: string }> }) {
  const folio = parsearId((await params).folio);
  const boleta = folio ? await obtenerBoleta(folio) : null;
  if (!boleta) notFound();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 print:hidden">
        Documento de prueba: no tiene validez tributaria.
      </p>
      <div className="text-center">
        <p className="text-xl font-bold">😊 Carrito Feliz</p>
        <p className="text-sm text-stone-500">Documento de prueba sin validez tributaria</p>
      </div>
      <DetalleBoleta boleta={boleta} />
      <div className="flex justify-end print:hidden">
        <BotonImprimir />
      </div>
    </div>
  );
}
