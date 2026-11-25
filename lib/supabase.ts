// Clientes de Supabase. Solo se importan desde código de servidor
// (Server Components y Server Actions): las claves nunca llegan al navegador.
import { createClient } from "@supabase/supabase-js";

function variable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre} en .env.local. ` +
        "Levanta la BD con `npx supabase start` y copia las claves que muestra `npx supabase status` " +
        "(Publishable/anon → SUPABASE_ANON_KEY, Secret/service_role → SUPABASE_SERVICE_ROLE_KEY). " +
        "Después reinicia `npm run dev`.",
    );
  }
  return valor;
}

const opciones = { auth: { persistSession: false, autoRefreshToken: false } };

/** Clave pública: lee el catálogo y las boletas, y llama a crear_boleta(). */
export function supabasePublico() {
  return createClient(variable("SUPABASE_URL"), variable("SUPABASE_ANON_KEY"), opciones);
}

/** Clave de servicio: solo para crear y editar productos (D9). */
export function supabaseAdmin() {
  return createClient(variable("SUPABASE_URL"), variable("SUPABASE_SERVICE_ROLE_KEY"), opciones);
}
