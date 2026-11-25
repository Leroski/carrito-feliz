"use server";

import { revalidatePath } from "next/cache";
import { supabasePublico } from "@/lib/supabase";

export type ResultadoBoleta = { folio: number } | { error: string };

/**
 * CU3: genera la boleta. Solo se envían ids y cantidades; precios, neto,
 * impuesto y total los calcula la BD en crear_boleta() (D4, CU3.5).
 */
export async function generarBoleta(
  items: { productoId: number; cantidad: number }[],
): Promise<ResultadoBoleta> {
  if (!Array.isArray(items) || items.length === 0) return { error: "El carrito está vacío" };

  const payload = items.map((i) => ({ producto_id: i.productoId, cantidad: i.cantidad }));
  const { data, error } = await supabasePublico().rpc("crear_boleta", { items: payload });
  if (error) return { error: error.message };

  revalidatePath("/boletas");
  return { folio: Number(data) };
}
