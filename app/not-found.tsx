import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">No encontrado</h1>
      <p className="text-stone-600">Lo que buscas no existe.</p>
      <Link href="/" className="text-emerald-700 underline">Volver al catálogo</Link>
    </div>
  );
}
