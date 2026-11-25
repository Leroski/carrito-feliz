"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export type EstadoFormulario = { error?: string };

function leerFormulario(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const precioTexto = String(formData.get("precio") ?? "").trim();
  const activo = formData.get("activo") !== null;

  // CU1.3: misma regla que los CHECK de la BD
  if (!nombre) return { error: "El nombre es obligatorio" } as const;
  if (!/^\d+$/.test(precioTexto)) return { error: "El precio debe ser un número entero mayor o igual a 0" } as const;
  const precio = Number(precioTexto);
  if (!Number.isSafeInteger(precio) || precio > 2_147_483_647) return { error: "El precio es demasiado grande" } as const;

  return { datos: { nombre, descripcion, precio, activo } } as const;
}

export async function crearProducto(_prev: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const r = leerFormulario(formData);
  if ("error" in r) return { error: r.error };

  const { data, error } = await supabaseAdmin().from("productos").insert(r.datos).select("id").single();
  if (error) return { error: `No se pudo crear el producto: ${error.message}` };

  revalidatePath("/");
  redirect(`/productos/${data.id}`);
}

export async function actualizarProducto(
  id: number,
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const r = leerFormulario(formData);
  if ("error" in r) return { error: r.error };

  const { error } = await supabaseAdmin().from("productos").update(r.datos).eq("id", id);
  if (error) return { error: `No se pudo guardar: ${error.message}` };

  revalidatePath("/");
  revalidatePath(`/productos/${id}`);
  redirect(`/productos/${id}`);
}
