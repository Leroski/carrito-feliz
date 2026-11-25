"use client";

import Link from "next/link";
import { useCarrito } from "./CarritoProvider";

export function ContadorCarrito() {
  const { unidades } = useCarrito();
  return (
    <Link href="/carrito" className="rounded-full bg-amber-400 px-4 py-1.5 font-semibold text-stone-900 hover:bg-amber-300">
      🛒 Carrito <span data-testid="contador-carrito">{unidades}</span>
    </Link>
  );
}
