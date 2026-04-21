export default function ManagerHome({ user }) {
  return (
    <div className="overview">
      <div>
        <p className="eyebrow">Sucursal asignada</p>
        <h2>Sucursal Central</h2>
        <p className="muted">Dirección pendiente de backend</p>
        <p className="muted">Usuario: {user?.email}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Productos</span>
          <strong>128</strong>
        </div>

        <div className="stat-card">
          <span>Órdenes</span>
          <strong>24</strong>
        </div>

        <div className="stat-card">
          <span>En tránsito</span>
          <strong>7</strong>
        </div>
      </div>
    </div>
  );
}