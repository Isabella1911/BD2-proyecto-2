import { useEffect, useState } from "react";
import { getOrdenes, getDetalleOrden } from "../../services/api";

export default function Historial({ user }) {
  const [ordenes, setOrdenes] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarOrdenes = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {};

        if (estadoFiltro) {
          params.estado = estadoFiltro;
        }

        const data = await getOrdenes(params);
        setOrdenes(Array.isArray(data) ? data : data.items ?? []);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
        setError(err.message || "No se pudieron cargar las órdenes.");
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [estadoFiltro]);

  const seleccionarOrden = async (orden) => {
    setOrdenSeleccionada(orden);
    setDetalle(null);
    setLoadingDetalle(true);
    setError("");

    try {
      const d = await getDetalleOrden(orden.id);
      setDetalle(d);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      setError(err.message || "No se pudo cargar el detalle de la orden.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  return (
    <div className="history-page">
      <p className="eyebrow">Historial</p>
      <h2>Historial de órdenes</h2>
      <p className="muted">
        Consulta el estado, productos, almacén y transporte de cada orden.
      </p>

      <section className="history-filter">
        <label>Filtrar por estado</label>
        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setOrdenSeleccionada(null);
            setDetalle(null);
          }}
        >
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Despachada">Despachada</option>
          <option value="En transporte">En transporte</option>
          <option value="Entregada">Entregada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </section>

      {error && <p className="muted">{error}</p>}

      <section className="history-layout">
        <div className="history-list">
          {loading ? (
            <p className="muted">Cargando órdenes...</p>
          ) : ordenes.length === 0 ? (
            <p className="muted">No hay órdenes.</p>
          ) : (
            ordenes.map((orden) => (
              <button
                key={orden.id}
                className={
                  ordenSeleccionada?.id === orden.id
                    ? "history-card active"
                    : "history-card"
                }
                onClick={() => seleccionarOrden(orden)}
              >
                <div>
                  <strong>{orden.id}</strong>
                  <span>{orden.fecha ? String(orden.fecha).slice(0, 10) : "Sin fecha"}</span>
                </div>

                <small>
                  Q{orden.total ?? 0} | {orden.urgencia || "Sin urgencia"} |{" "}
                  {orden.estado || "Sin estado"}
                </small>
              </button>
            ))
          )}
        </div>

        <div className="history-detail">
          {!ordenSeleccionada ? (
            <p className="muted">Selecciona una orden para ver el detalle.</p>
          ) : loadingDetalle ? (
            <p className="muted">Cargando detalle...</p>
          ) : detalle ? (
            <>
              <div className="history-detail-header">
                <div>
                  <p className="eyebrow">Detalle de orden</p>
                  <h3>{detalle.orden?.id || ordenSeleccionada.id}</h3>
                </div>

                <span className="status-badge">
                  {detalle.orden?.estado || ordenSeleccionada.estado}
                </span>
              </div>

              <div className="detail-grid">
                <p>
                  <strong>Fecha:</strong>
                  <span>
                    {detalle.orden?.fecha
                      ? String(detalle.orden.fecha).slice(0, 10)
                      : "Sin fecha"}
                  </span>
                </p>

                <p>
                  <strong>Urgencia:</strong>
                  <span>{detalle.orden?.urgencia || "—"}</span>
                </p>

                <p>
                  <strong>Destino:</strong>
                  <span>{detalle.destino?.nombre || "—"}</span>
                </p>

                <p>
                  <strong>Transportista:</strong>
                  <span>{detalle.transportista?.nombre || "Sin asignar"}</span>
                </p>

                <p>
                  <strong>Fecha entrega:</strong>
                  <span>
                    {detalle.transportista?.rel?.fecha_entrega || "Pendiente"}
                  </span>
                </p>
              </div>

              <h4>Productos incluidos</h4>

              <div className="history-items">
                {Array.isArray(detalle.items) && detalle.items.length > 0 ? (
                  detalle.items.map((item, i) => (
                    <div key={i} className="history-item-row">
                      <span>{item.nombre || "Producto"}</span>
                      <span>{item.cantidad ?? 0} unidades</span>
                      <strong>Q{item.subtotal ?? 0}</strong>
                    </div>
                  ))
                ) : (
                  <p className="muted">Esta orden no tiene productos asociados.</p>
                )}
              </div>

              <div className="history-total">
                <span>Total</span>
                <strong>Q{detalle.orden?.total ?? ordenSeleccionada.total ?? 0}</strong>
              </div>
            </>
          ) : (
            <p className="muted">No se encontró detalle para esta orden.</p>
          )}
        </div>
      </section>
    </div>
  );
}