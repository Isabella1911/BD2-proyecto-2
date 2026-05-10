import { useState } from "react";
import {
  getAgregadosUsuarios,
  getAgregadosSupermercados,
  getAgregadosProductos,
  getAgregadosAlmacenes,
  getAgregadosOrdenes,
  getAgregadosTransportistas,
} from "../../services/api";

const REPORTES = {
  usuarios: {
    titulo: "Usuarios",
    descripcion: "Resumen de usuarios por rol o estado.",
    cargar: getAgregadosUsuarios,
  },
  supermercados: {
    titulo: "Supermercados",
    descripcion: "Resumen de sucursales activas e inactivas.",
    cargar: getAgregadosSupermercados,
  },
  productos: {
    titulo: "Productos",
    descripcion: "Resumen de productos por categoría y disponibilidad.",
    cargar: getAgregadosProductos,
  },
  almacenes: {
    titulo: "Almacenes",
    descripcion: "Resumen de almacenes por estado y capacidad.",
    cargar: getAgregadosAlmacenes,
  },
  ordenes: {
    titulo: "Órdenes",
    descripcion: "Resumen de órdenes por estado, urgencia y total.",
    cargar: getAgregadosOrdenes,
  },
  transportistas: {
    titulo: "Transportistas",
    descripcion: "Resumen de transportistas activos y rating.",
    cargar: getAgregadosTransportistas,
  },
};

export default function Reportes() {
  const [tipo, setTipo] = useState("ordenes");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reporteActual = REPORTES[tipo];

  const cargarReporte = async () => {
    setLoading(true);
    setError("");

    try {
      const resultado = await reporteActual.cargar();
      setData(resultado);
    } catch (e) {
      setError(e.message || "No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const renderValor = (valor) => {
    if (valor === null || valor === undefined) return "—";
    if (Array.isArray(valor)) return valor.join(", ");
    if (typeof valor === "object") return JSON.stringify(valor, null, 2);
    return String(valor);
  };

  return (
    <div className="reportes-page">
      <p className="eyebrow">Consultas agregadas</p>
      <h2>Panel de reportes</h2>
      <p className="muted">
        Ejecuta consultas agregadas para analizar información general del sistema.
      </p>

      <section className="reportes-selector">
        {Object.keys(REPORTES).map((key) => (
          <button
            key={key}
            className={tipo === key ? "active" : ""}
            onClick={() => {
              setTipo(key);
              setData(null);
              setError("");
            }}
          >
            {REPORTES[key].titulo}
          </button>
        ))}
      </section>

      <section className="reportes-panel">
        <div className="reportes-header">
          <div>
            <h3>{reporteActual.titulo}</h3>
            <p>{reporteActual.descripcion}</p>
          </div>

          <button className="an-btn-primary" onClick={cargarReporte} disabled={loading}>
            {loading ? "Cargando..." : "Ejecutar consulta"}
          </button>
        </div>

        {error && <div className="flash-msg flash-err">{error}</div>}

        {!data && !error && (
          <p className="an-empty">
            Haz clic en “Ejecutar consulta” para cargar los resultados.
          </p>
        )}

        {data && (
          <div className="reportes-results">
            {Array.isArray(data) ? (
              data.map((item, index) => (
                <div className="reporte-card" key={index}>
                  {Object.entries(item).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}</strong>
                      <span>{renderValor(value)}</span>
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <div className="reporte-card">
                {Object.entries(data).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}</strong>
                    <span>{renderValor(value)}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}