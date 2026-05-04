import { useEffect, useState } from "react";
import { getOrdenes } from "../../services/api";

export default function HistorialGlobal() {
  const [ordenes, setOrdenes] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {};
    if (estadoFiltro) params.estado = estadoFiltro;

    setLoading(true);
    getOrdenes(params)
      .then(setOrdenes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [estadoFiltro]);

  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Historial global</p>
      <h2>Todas las órdenes</h2>
      <p className="muted">
        Vista general de órdenes creadas por todas las sucursales.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtrar por estado: </label>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="en_transporte">En transporte</option>
          <option value="entregada">Entregada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {loading ? (
        <p className="muted">Cargando órdenes...</p>
      ) : (
        <div className="data-list">
          {ordenes.length === 0 ? (
            <p className="muted">No hay órdenes.</p>
          ) : (
            ordenes.map((orden) => (
              <p key={orden.id}>
                <strong>{orden.id}</strong>
                <span>
                  {orden.estado} | Q{orden.total} | {orden.urgencia}
                </span>
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}