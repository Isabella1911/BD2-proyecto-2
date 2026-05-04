import { useEffect, useState } from "react";
import { getSupermercados, getOrdenes, getAgregadosOrdenes } from "../../services/api";

export default function GerenteHome({ user }) {
  const [stats, setStats] = useState({
    sucursales_activas: 0,
    ordenes_total: 0,
    en_transporte: 0,
  });

  useEffect(() => {
    async function cargar() {
      try {
        const [supermercados, ordenes, agregados] = await Promise.all([
          getSupermercados({ activo: true }),
          getOrdenes(),
          getAgregadosOrdenes(),
        ]);

        const en_transporte =
          agregados.find((a) => a.estado === "en_transporte")?.total || 0;

        setStats({
          sucursales_activas: supermercados.length,
          ordenes_total: ordenes.length,
          en_transporte,
        });
      } catch (err) {
        console.error("Error cargando stats gerente:", err);
      }
    }
    cargar();
  }, []);

  return (
    <div className="overview">
      <p className="eyebrow">Vista general</p>
      <h2>Gerencia general</h2>
      <p className="muted">Correo: {user?.correo}</p>

      <div className="stats-row">
        <div className="stat-card">
          <span>Sucursales activas</span>
          <strong>{stats.sucursales_activas}</strong>
        </div>

        <div className="stat-card">
          <span>Órdenes totales</span>
          <strong>{stats.ordenes_total}</strong>
        </div>

        <div className="stat-card">
          <span>En transporte</span>
          <strong>{stats.en_transporte}</strong>
        </div>
      </div>
    </div>
  );
}