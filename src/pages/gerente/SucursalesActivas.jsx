import { useEffect, useState } from "react";
import { getSupermercados } from "../../services/api";

export default function SucursalesActivas() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupermercados({ activo: true })
      .then(setSucursales)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-panel gerente-panel">
      <p className="eyebrow">Sucursales</p>
      <h2>Sucursales activas</h2>

      {loading ? (
        <p className="muted">Cargando sucursales...</p>
      ) : (
        <div className="data-list">
          {sucursales.length === 0 ? (
            <p className="muted">No hay sucursales activas.</p>
          ) : (
            sucursales.map((s) => (
              <p key={s.id}>
                <strong>{s.nombre}</strong>
                <span>{s.direccion} — {s.cadena}</span>
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}