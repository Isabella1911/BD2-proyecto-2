import { useState } from "react";
import GerenteHome from "./GerenteHome";
import HistorialGlobal from "./HistorialGlobal";
import SucursalesActivas from "./SucursalesActivas";
import ProductosPorSucursal from "./ProductosPorSucursal";

export default function GerenteLayout({ user, onLogout }) {
  const [section, setSection] = useState("inicio");

  const renderPage = () => {
    if (section === "historial") return <HistorialGlobal />;
    if (section === "sucursales") return <SucursalesActivas />;
    if (section === "productos") return <ProductosPorSucursal />;
    return <GerenteHome user={user} />;
  };

  return (
    <main className="manager-page">
      <section className="manager-shell">
        <aside className="manager-sidebar">
          <h2>Gerencia</h2>

          <button
            className={section === "inicio" ? "active" : ""}
            onClick={() => setSection("inicio")}
          >
            Resumen
          </button>

          <button
            className={section === "historial" ? "active" : ""}
            onClick={() => setSection("historial")}
          >
            Historial de órdenes
          </button>

          <button
            className={section === "sucursales" ? "active" : ""}
            onClick={() => setSection("sucursales")}
          >
            Sucursales activas
          </button>

          <button
            className={section === "productos" ? "active" : ""}
            onClick={() => setSection("productos")}
          >
            Productos por sucursal
          </button>
        </aside>

        <section className="manager-main">
          <header className="manager-header">
            <div>
              <p className="eyebrow">Panel de gerente</p>
              <h1>Super Mart</h1>
            </div>

            <div className="logo-box">
              <span>Logo</span>
              {/* Luego puedes usar:
              <img src="/src/assets/logo.png" alt="Logo Super Mart" />
              */}
            </div>
          </header>

          <section className="manager-content">{renderPage()}</section>

          <div className="logout-container">
            <button className="logout-btn" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}