const sucursales = [
  {
    id: 1,
    nombre: "Sucursal Central",
    direccion: "Zona 10",
    activa: true,
    manager: "Manager Central",
  },
  {
    id: 2,
    nombre: "Sucursal Norte",
    direccion: "Mixco",
    activa: true,
    manager: "Manager Norte",
  },
  {
    id: 3,
    nombre: "Sucursal Sur",
    direccion: "Villa Nueva",
    activa: true,
    manager: "Manager Sur",
  },
];

export default function SucursalesActivas() {
  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Sucursales</p>
      <h2>Sucursales activas</h2>

      {/* BACKEND FUTURO:
        GET /api/sucursales?activo=true
      */}

      <div className="data-list">
        {sucursales.map((sucursal) => (
          <p key={sucursal.id}>
            <strong>{sucursal.nombre}</strong>
            <span>{sucursal.direccion}</span>
          </p>
        ))}
      </div>
    </div>
  );
}