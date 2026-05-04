import { useEffect, useState } from "react";
import { getOrdenes, getInventarioSupermercado, getUsuariosSupermercado } from "../../services/api";

export default function ManagerHome({ user }) {
  const [stats, setStats] = useState({ productos: 0, ordenes: 0, en_transporte: 0 });
  const [sucursal, setSucursal] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        // Si el usuario tiene supermercado_id en su perfil lo usamos
        const sid = user?.supermercado_id;

        // Órdenes del manager
        const ordenes = await getOrdenes(
          user?.id ? { usuario_id: user.id } : {}
        );
        const en_transporte = ordenes.filter(
          (o) => o.estado === "en_transporte"
        ).length;

        // Inventario de la sucursal asignada
        let productos = 0;
        if (sid) {
          const inventario = await getInventarioSupermercado(sid);
          productos = inventario.length;
        }

        setStats({ productos, ordenes: ordenes.length, en_transporte });
      } catch (err) {
        console.error("Error cargando stats:", err);
      }
    }
    cargar();
  }, [user]);

  return (
    <div className="overview">
      <div>
        <p className="eyebrow">Sucursal asignada</p>
        <h2>{user?.nombre || "Manager"}</h2>
        <p className="muted">Rol: {user?.rol}</p>
        <p className="muted">Correo: {user?.correo}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Productos</span>
          <strong>{stats.productos}</strong>
        </div>

        <div className="stat-card">
          <span>Órdenes</span>
          <strong>{stats.ordenes}</strong>
        </div>

        <div className="stat-card">
          <span>En tránsito</span>
          <strong>{stats.en_transporte}</strong>
        </div>
      </div>
    </div>
  );
}