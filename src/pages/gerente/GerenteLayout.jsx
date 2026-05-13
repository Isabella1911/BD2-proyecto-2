import { useState } from "react";
import GerenteHome from "./GerenteHome";
import HistorialGlobal from "./HistorialGlobal";
import SucursalesActivas from "./SucursalesActivas";
import ProductosPorSucursal from "./ProductosPorSucursal";
import AdminNodos from "./AdminNodos";
import GestionRelaciones from "./GestionRelaciones";
import Reportes from "./Reportes";
import logo from "../../assets/logo.png";

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

  const buttonStyle = (key) => ({
    width: "100%",
    border: "none",
    background: section === key ? "rgba(255,255,255,0.22)" : "transparent",
    color: "white",
    textAlign: "left",
    padding: "14px 18px",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    lineHeight: "1.15",
  });

  return (
    <main className="manager-page">
      <section className="manager-shell">
        <aside
          style={{
            background: "#d94145",
            color: "white",
            padding: "38px 28px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              margin: "0 0 42px",
              fontSize: "28px",
              fontWeight: "800",
              color: "white",
            }}
          >
            Super Mart
          </h2>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <button style={buttonStyle("inicio")} onClick={() => setSection("inicio")}>
              Resumen
            </button>

            <button style={buttonStyle("historial")} onClick={() => setSection("historial")}>
              Historial de órdenes
            </button>

            <button style={buttonStyle("sucursales")} onClick={() => setSection("sucursales")}>
              Sucursales activas
            </button>

            <button style={buttonStyle("productos")} onClick={() => setSection("productos")}>
              Productos por sucursal
            </button>

            <button style={buttonStyle("nodos")} onClick={() => setSection("nodos")}>
              Gestión de Nodos
            </button>

            <button style={buttonStyle("relaciones")} onClick={() => setSection("relaciones")}>
              Gestión de Relaciones
            </button>

            <button style={buttonStyle("reportes")} onClick={() => setSection("reportes")}>
              Reportes
            </button>
          </nav>
        </aside>

        <section className="manager-main">
          <header className="manager-header">
            <div>
              <p className="eyebrow">Panel de gerente</p>
              <h1>Super Mart</h1>
            </div>

            <div className="logo-box">
              <img src={logo} alt="Logo Super Mart" />
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