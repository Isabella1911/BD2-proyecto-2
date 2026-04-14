import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Manager({ user, onLogout }) {
  const [section, setSection] = useState("inicio");

  return (
    <main className="manager-page">
      <section className="manager-shell">
        <Sidebar section={section} setSection={setSection} />

        <section className="manager-main">
          <header className="manager-header">
            <div>
              <p className="eyebrow">Panel de sucursal</p>
              <h1>Super Mart</h1>
            </div>

            <div className="logo-box">
              {/* Coloca tu logo en: src/assets/logo.png */}
              <img src="/src/assets/logo.png" alt="Logo Super Mart" />
            </div>
          </header>

          <section className="manager-content">
            {section === "inicio" && <InicioSucursal user={user} />}
            {section === "inventario" && <Inventario />}
            {section === "ordenes" && <Ordenes />}
            {section === "transporte" && <Transporte />}
            {section === "historial" && <Historial />}
          </section>

          <button className="logout-btn" onClick={onLogout}>
            Cerrar sesión
          </button>
        </section>
      </section>
    </main>
  );
}

function InicioSucursal({ user }) {
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

function Inventario() {
  return (
    <div className="section-panel">
      <h2>Cantidad de productos</h2>
      <p className="muted">Inventario actual de la sucursal.</p>

      {/* API FUTURA:
        GET /api/sucursales/:id/productos
      */}

      <div className="data-list">
        <p><strong>Leche</strong><span>25 unidades</span></p>
        <p><strong>Pan</strong><span>40 unidades</span></p>
        <p><strong>Arroz</strong><span>18 unidades</span></p>
      </div>
    </div>
  );
}

function Ordenes() {
  return (
    <div className="section-panel">
      <h2>Órdenes a almacén</h2>
      <p className="muted">Solicitud de productos para abastecimiento.</p>

      {/* API FUTURA:
        POST /api/ordenes
      */}

      <input placeholder="Producto" />
      <input placeholder="Cantidad" />
      <button>Crear orden</button>
    </div>
  );
}

function Transporte() {
  return (
    <div className="section-panel">
      <h2>Coordinar transporte</h2>
      <p className="muted">Asignación de vehículo o encargado.</p>

      {/* API FUTURA:
        POST /api/transporte/asignar
      */}

      <input placeholder="No. de orden" />
      <input placeholder="Vehículo o piloto" />
      <button>Coordinar transporte</button>
    </div>
  );
}

function Historial() {
  return (
    <div className="section-panel">
      <h2>Historial de órdenes</h2>

      {/* API FUTURA:
        GET /api/sucursales/:id/ordenes
      */}

      <div className="data-list">
        <p><strong>Orden #001</strong><span>Entregada</span></p>
        <p><strong>Orden #002</strong><span>En camino</span></p>
        <p><strong>Orden #003</strong><span>Pendiente</span></p>
      </div>
    </div>
  );
}