export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
};

export type Boleta = {
  folio: number;
  tipo: "boleta" | "factura";
  neto: number;
  impuesto: number;
  total: number;
  created_at: string;
};

export type BoletaItem = {
  id: number;
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
};
