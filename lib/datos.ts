import { connection } from "next/server";
import { supabasePublico } from "./supabase";
import type { Boleta, BoletaItem, Producto } from "./tipos";

// connection(): estos datos cambian con cada venta, así que se leen
// siempre en el momento de la petición, nunca en el prerender.

export async function listarProductos(): Promise<Producto[]> {
  await connection();
  const { data, error } = await supabasePublico()
    .from("productos")
    .select("id, nombre, descripcion, precio, activo")
    .eq("activo", true)
    .order("nombre");
  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerProducto(id: number): Promise<Producto | null> {
  await connection();
  const { data, error } = await supabasePublico()
    .from("productos")
    .select("id, nombre, descripcion, precio, activo")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listarBoletas(): Promise<Boleta[]> {
  await connection();
  const { data, error } = await supabasePublico()
    .from("boletas")
    .select("folio, tipo, neto, impuesto, total, created_at")
    .order("folio", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerBoleta(
  folio: number,
): Promise<(Boleta & { items: BoletaItem[] }) | null> {
  await connection();
  const { data, error } = await supabasePublico()
    .from("boletas")
    .select(
      "folio, tipo, neto, impuesto, total, created_at, items:boleta_items(id, producto_id, nombre, precio_unitario, cantidad, subtotal)",
    )
    .eq("folio", folio)
    .order("nombre", { referencedTable: "boleta_items" })
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Convierte un segmento de URL en id entero positivo, o null. */
export function parsearId(valor: string): number | null {
  return /^\d+$/.test(valor) && Number(valor) > 0 ? Number(valor) : null;
}
