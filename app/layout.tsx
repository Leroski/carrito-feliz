import type { Metadata } from "next";
import Link from "next/link";
import { CarritoProvider } from "./componentes/CarritoProvider";
import { ContadorCarrito } from "./componentes/ContadorCarrito";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carrito Feliz",
  description: "Catálogo, carrito y boletas con impuesto fijo del 15 %",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <CarritoProvider>
          {/* CU2.4: el contador del carrito se ve en todas las páginas */}
          <header className="border-b border-stone-200 bg-white print:hidden">
            <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
              <Link href="/" className="text-lg font-bold text-emerald-700">
                😊 Carrito Feliz
              </Link>
              <Link href="/" className="text-stone-700 hover:text-emerald-700">Catálogo</Link>
              <Link href="/boletas" className="text-stone-700 hover:text-emerald-700">Boletas</Link>
              <span className="ml-auto">
                <ContadorCarrito />
              </span>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        </CarritoProvider>
      </body>
    </html>
  );
}
