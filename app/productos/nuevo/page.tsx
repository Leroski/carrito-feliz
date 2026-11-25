import { crearProducto } from "../acciones";
import { FormularioProducto } from "../FormularioProducto";

export default function NuevoProductoPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>
      <FormularioProducto accion={crearProducto} textoBoton="Crear producto" />
    </>
  );
}
