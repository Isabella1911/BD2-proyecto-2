import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ManagerHome from "./ManagerHome";
import Inventario from "./Inventario";
import Ordenes from "./Ordenes";
import Transporte from "./Transporte";
import Historial from "./Historial";

export default function ManagerLayout({ user, onLogout }) {
  const [section, setSection] = useState("inicio");

  const renderPage = () => {
    if (section === "inventario") return <Inventario />;
    if (section === "ordenes") return <Ordenes />;
    if (section === "transporte") return <Transporte />;
    if (section === "historial") return <Historial />;
    return <ManagerHome user={user} />;
  };

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
              <span>Logo</span>
              {/* Cuando tengas tu logo:
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