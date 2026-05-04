import { useEffect, useState } from "react";
import { getOrdenes, getTransportistas, asignarTransporte } from "../../services/api";

export default function Transporte() {
  const [ordenes, setOrdenes] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [ordenId, setOrdenId] = useState("");
  const [transportistaId, setTransportistaId] = useState("");
  const [costo, setCosto] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Órdenes pendientes o aprobadas (sin transporte aún)
    getOrdenes({ estado: "pendiente" })
      .then(setOrdenes)
      .catch(console.error);

    getTransportistas({ activo: true })
      .then(setTransportistas)
      .catch(console.error);
  }, []);

  const ordenSeleccionada = ordenes.find((o) => o.id === ordenId);
  const transportistaSeleccionado = transportistas.find(
    (t) => t.id === transportistaId
  );

  const asignar = async () => {
    if (!ordenId || !transportistaId || !costo || !ubicacion || !fechaEntrega) {
      alert("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await asignarTransporte({
        orden_id: ordenId,
        transportista_id: transportistaId,
        costo: Number(costo),
        ubicacion,
        fecha_entrega: fechaEntrega,
      });

      // Actualizar estado de la orden a en_transporte
      await fetch(`http://localhost:8000/api/ordenes/${ordenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "en_transporte" }),
      });

      alert("¡Transporte asignado exitosamente!");

      // Refrescar órdenes
      const nuevasOrdenes = await getOrdenes({ estado: "pendiente" });
      setOrdenes(nuevasOrdenes);

      setOrdenId("");
      setTransportistaId("");
      setCosto("");
      setUbicacion("");
      setFechaEntrega("");
    } catch (err) {
      alert("Error asignando transporte: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transport-page">
      <p className="eyebrow">Transporte</p>
      <h2>Organizar transporte de órdenes</h2>
      <p className="muted">
        Asigna un transportista activo a una orden pendiente.
      </p>

      <section className="transport-layout">
        <div className="transport-panel">
          <h3>Órdenes pendientes</h3>
          <div className="transport-list">
            {ordenes.length === 0 ? (
              <p className="muted">No hay órdenes pendientes.</p>
            ) : (
              ordenes.map((orden) => (
                <button
                  key={orden.id}
                  className={
                    ordenId === orden.id ? "transport-card active" : "transport-card"
                  }
                  onClick={() => setOrdenId(orden.id)}
                >
                  <strong>{orden.id}</strong>
                  <small>
                    Q{orden.total} | {orden.urgencia} | {orden.estado}
                  </small>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="transport-panel">
          <h3>Transportistas activos</h3>
          <div className="transport-list">
            {transportistas.map((t) => (
              <button
                key={t.id}
                className={
                  transportistaId === t.id
                    ? "transport-card active"
                    : "transport-card"
                }
                onClick={() => setTransportistaId(t.id)}
              >
                <strong>{t.nombre}</strong>
                <span>{t.transporte}</span>
                <small>Rating {t.rating} | {t.flota}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="assignment-panel">
        <h3>Datos de asignación</h3>

        <div className="assignment-grid">
          <input
            type="number"
            placeholder="Costo del transporte"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
          <input
            placeholder="Ubicación actual"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
          <input
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div className="assignment-summary">
          <p>
            <strong>Orden:</strong>{" "}
            {ordenSeleccionada ? ordenSeleccionada.id : "No seleccionada"}
          </p>
          <p>
            <strong>Transportista:</strong>{" "}
            {transportistaSeleccionado
              ? transportistaSeleccionado.nombre
              : "No seleccionado"}
          </p>
        </div>

        <button
          className="assign-transport-btn"
          onClick={asignar}
          disabled={loading}
        >
          {loading ? "Asignando..." : "Asignar transporte"}
        </button>
      </section>
    </div>
  );
}