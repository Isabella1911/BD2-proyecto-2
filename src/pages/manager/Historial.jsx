import { useState } from "react";

const ordenesHistorialMock = [
  {
    id: "ORD-001",
    fecha: "2026-05-01",
    almacen: "Almacén Central",
    sucursal: "Sucursal Central",
    total: 850,
    urgencia: "Alta",
    estado: "Entregada",
    transportista: "Carlos Méndez",
    fechaEntrega: "2026-05-03",
    items: [
      { producto: "Corte de carne", cantidad: 10, subtotal: 350 },
      { producto: "Pollo", cantidad: 20, subtotal: 500 },
    ],
  },
  {
    id: "ORD-002",
    fecha: "2026-05-02",
    almacen: "Almacén Norte",
    sucursal: "Sucursal Central",
    total: 430,
    urgencia: "Normal",
    estado: "En transporte",
    transportista: "María López",
    fechaEntrega: "2026-05-06",
    items: [
      { producto: "Leche", cantidad: 30, subtotal: 240 },
      { producto: "Queso", cantidad: 10, subtotal: 180 },
    ],
  },
  {
    id: "ORD-003",
    fecha: "2026-05-04",
    almacen: "Almacén Central",
    sucursal: "Sucursal Central",
    total: 1200,
    urgencia: "Urgente",
    estado: "Pendiente",
    transportista: "Sin asignar",
    fechaEntrega: "Pendiente",
    items: [
      { producto: "Papas", cantidad: 100, subtotal: 500 },
      { producto: "Tomates", cantidad: 100, subtotal: 600 },
    ],
  },
];

export default function Historial() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const ordenesFiltradas =
    estadoFiltro === "Todos"
      ? ordenesHistorialMock
      : ordenesHistorialMock.filter((orden) => orden.estado === estadoFiltro);

  return (
    <div className="history-page">
      <p className="eyebrow">Historial</p>
      <h2>Historial de órdenes</h2>
      <p className="muted">
        Consulta el estado, productos, almacén y transporte de cada orden.
      </p>

      {/* CUANDO HAYA BACKEND:
        Quitar ordenesHistorialMock y cargar las órdenes reales con:
        GET /api/sucursales/:id/ordenes

        El backend debería devolver:
        Orden + Almacén + Productos incluidos + Transportista asignado
      */}

      <section className="history-filter">
        <label>Filtrar por estado</label>

        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setOrdenSeleccionada(null);
          }}
        >
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Aprobada</option>
          <option>En transporte</option>
          <option>Entregada</option>
          <option>Cancelada</option>
        </select>
      </section>

      <section className="history-layout">
        <div className="history-list">
          {ordenesFiltradas.map((orden) => (
            <button
              key={orden.id}
              className={
                ordenSeleccionada?.id === orden.id
                  ? "history-card active"
                  : "history-card"
              }
              onClick={() => setOrdenSeleccionada(orden)}
            >
              <div>
                <strong>{orden.id}</strong>
                <span>{orden.fecha}</span>
              </div>

              <p>
                {orden.almacen} → {orden.sucursal}
              </p>

              <small>
                Q{orden.total} | {orden.urgencia} | {orden.estado}
              </small>
            </button>
          ))}
        </div>

        <div className="history-detail">
          {!ordenSeleccionada ? (
            <p className="muted">Selecciona una orden para ver el detalle.</p>
          ) : (
            <>
              <div className="history-detail-header">
                <div>
                  <p className="eyebrow">Detalle de orden</p>
                  <h3>{ordenSeleccionada.id}</h3>
                </div>

                <span className="status-badge">
                  {ordenSeleccionada.estado}
                </span>
              </div>

              <div className="detail-grid">
                <p>
                  <strong>Fecha:</strong>
                  <span>{ordenSeleccionada.fecha}</span>
                </p>

                <p>
                  <strong>Almacén:</strong>
                  <span>{ordenSeleccionada.almacen}</span>
                </p>

                <p>
                  <strong>Sucursal:</strong>
                  <span>{ordenSeleccionada.sucursal}</span>
                </p>

                <p>
                  <strong>Urgencia:</strong>
                  <span>{ordenSeleccionada.urgencia}</span>
                </p>

                <p>
                  <strong>Transportista:</strong>
                  <span>{ordenSeleccionada.transportista}</span>
                </p>

                <p>
                  <strong>Entrega:</strong>
                  <span>{ordenSeleccionada.fechaEntrega}</span>
                </p>
              </div>

              <h4>Productos incluidos</h4>

              <div className="history-items">
                {ordenSeleccionada.items.map((item, index) => (
                  <div key={index} className="history-item-row">
                    <span>{item.producto}</span>
                    <span>{item.cantidad} unidades</span>
                    <strong>Q{item.subtotal}</strong>
                  </div>
                ))}
              </div>

              <div className="history-total">
                <span>Total</span>
                <strong>Q{ordenSeleccionada.total}</strong>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}