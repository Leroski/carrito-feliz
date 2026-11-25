const fecha = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

export function formatFecha(iso: string): string {
  return fecha.format(new Date(iso));
}
