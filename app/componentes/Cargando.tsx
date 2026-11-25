export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return <p className="animate-pulse text-stone-500">{texto}</p>;
}
