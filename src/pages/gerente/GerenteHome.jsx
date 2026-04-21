export default function GerenteHome({ user }) {
  return (
    <div className="overview">
      <p className="eyebrow">Vista general</p>
      <h2>Gerencia general</h2>
      <p className="muted">Usuario: {user?.email}</p>

      <div className="stats-row">
        <div className="stat-card">
          <span>Sucursales activas</span>
          <strong>5</strong>
        </div>

        <div className="stat-card">
          <span>Órdenes totales</span>
          <strong>42</strong>
        </div>

        <div className="stat-card">
          <span>En transporte</span>
          <strong>8</strong>
        </div>
      </div>
    </div>
  );
}