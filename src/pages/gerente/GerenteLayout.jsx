import { useState } from "react";
import GerenteHome from "./GerenteHome";
import HistorialGlobal from "./HistorialGlobal";
import SucursalesActivas from "./SucursalesActivas";
import ProductosPorSucursal from "./ProductosPorSucursal";
import AdminNodos from "./AdminNodos";
import GestionRelaciones from "./GestionRelaciones";
import Reportes from "./Reportes";

export default function GerenteLayout({ user, onLogout }) {
  const [section, setSection] = useState("inicio");

  const renderPage = () => {
    if (section === "historial") return <HistorialGlobal />;
    if (section === "sucursales") return <SucursalesActivas />;
    if (section === "productos") return <ProductosPorSucursal />;
    if (section === "nodos") return <AdminNodos />;
    if (section === "relaciones") return <GestionRelaciones />;
    if (section === "reportes") return <Reportes />;
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

          <button
            className={section === "nodos" ? "active" : ""}
            onClick={() => setSection("nodos")}
          >
            Gestión de Nodos
          </button>

          <button
            className={section === "relaciones" ? "active" : ""}
            onClick={() => setSection("relaciones")}
          >
            Gestión de Relaciones
          </button>

          <button
            className={section === "reportes" ? "active" : ""}
            onClick={() => setSection("reportes")}
          >
            Reportes
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