import { useEffect, useState } from "react";
import { getSupermercados, getInventarioSupermercado } from "../../services/api";

export default function ProductosPorSucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSupermercados()
      .then((data) => {
        setSucursales(data);
        if (data.length > 0) setSucursalId(data[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!sucursalId) return;
    setLoading(true);
    getInventarioSupermercado(sucursalId)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sucursalId]);

  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Inventario general</p>
      <h2>Productos por sucursal</h2>

      <select
        className="gerente-select"
        value={sucursalId}
        onChange={(e) => setSucursalId(e.target.value)}
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="muted">Cargando productos...</p>
      ) : (
        <div className="data-list">
          {productos.length === 0 ? (
            <p className="muted">No hay productos en esta sucursal.</p>
          ) : (
            productos.map((p) => (
              <p key={p.id}>
                <strong>{p.nombre}</strong>
                <span>{p.cantidad} unidades — {p.categoria}</span>
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}