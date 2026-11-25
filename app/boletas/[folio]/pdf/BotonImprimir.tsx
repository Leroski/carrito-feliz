"use client";

export function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">
      Imprimir / Guardar como PDF
    </button>
  );
}
