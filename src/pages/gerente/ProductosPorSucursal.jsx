import { useState } from "react";

const dataMock = [
  {
    id: 1,
    sucursal: "Sucursal Central",
    productos: [
      { nombre: "Corte de carne", cantidad: 20 },
      { nombre: "Papas", cantidad: 50 },
      { nombre: "Leche", cantidad: 80 },
    ],
  },
  {
    id: 2,
    sucursal: "Sucursal Norte",
    productos: [
      { nombre: "Pollo", cantidad: 35 },
      { nombre: "Tomates", cantidad: 42 },
      { nombre: "Queso", cantidad: 28 },
    ],
  },
  {
    id: 3,
    sucursal: "Sucursal Sur",
    productos: [
      { nombre: "Agua pura", cantidad: 100 },
      { nombre: "Jugos", cantidad: 44 },
      { nombre: "Detergente", cantidad: 32 },
    ],
  },
];

export default function ProductosPorSucursal() {
  const [sucursalId, setSucursalId] = useState(dataMock[0].id);

  const sucursalSeleccionada = dataMock.find((s) => s.id === Number(sucursalId));

  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Inventario general</p>
      <h2>Productos por sucursal</h2>

      {/* BACKEND FUTURO:
        GET /api/sucursales
        GET /api/sucursales/:id/productos
      */}

      <select
        className="gerente-select"
        value={sucursalId}
        onChange={(e) => setSucursalId(e.target.value)}
      >
        {dataMock.map((sucursal) => (
          <option key={sucursal.id} value={sucursal.id}>
            {sucursal.sucursal}
          </option>
        ))}
      </select>

      <div className="data-list">
        {sucursalSeleccionada.productos.map((producto) => (
          <p key={producto.nombre}>
            <strong>{producto.nombre}</strong>
            <span>{producto.cantidad} unidades</span>
          </p>
        ))}
      </div>
    </div>
  );
}