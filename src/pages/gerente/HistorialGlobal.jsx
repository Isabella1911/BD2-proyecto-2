const ordenes = [
  {
    id: "ORD-001",
    sucursal: "Sucursal Central",
    almacen: "Almacén Central",
    estado: "Entregada",
    total: 850,
    urgencia: "Alta",
  },
  {
    id: "ORD-002",
    sucursal: "Sucursal Norte",
    almacen: "Almacén Norte",
    estado: "En transporte",
    total: 430,
    urgencia: "Normal",
  },
  {
    id: "ORD-003",
    sucursal: "Sucursal Sur",
    almacen: "Almacén Central",
    estado: "Pendiente",
    total: 1200,
    urgencia: "Urgente",
  },
];

export default function HistorialGlobal() {
  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Historial global</p>
      <h2>Todas las órdenes</h2>
      <p className="muted">
        Vista general de órdenes creadas por todas las sucursales.
      </p>

      {/* BACKEND FUTURO:
        GET /api/ordenes
      */}

      <div className="data-list">
        {ordenes.map((orden) => (
          <p key={orden.id}>
            <strong>
              {orden.id} - {orden.sucursal}
            </strong>
            <span>
              {orden.estado} | Q{orden.total}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}