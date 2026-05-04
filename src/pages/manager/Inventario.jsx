import { useEffect, useState } from "react";
import { getSupermercados, getInventarioSupermercado } from "../../services/api";

export default function Inventario({ user }) {
  const [supermercados, setSupermercados] = useState([]);
  const [supermercadoId, setSupermercadoId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar supermercados al montar
  useEffect(() => {
    getSupermercados({ activo: true })
      .then((data) => {
        setSupermercados(data);
        if (data.length > 0) setSupermercadoId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Cargar inventario cuando cambia el supermercado seleccionado
  useEffect(() => {
    if (!supermercadoId) return;
    setLoading(true);
    getInventarioSupermercado(supermercadoId)
      .then((items) => {
        // Agrupar por categoría
        const grouped = items.reduce((acc, item) => {
          const cat = item.categoria || "Sin categoría";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});

        setCategorias(
          Object.entries(grouped).map(([category, items]) => ({
            category,
            items,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [supermercadoId]);

  return (
    <div className="inventory-page">
      <p className="eyebrow">Inventario</p>
      <h2>Productos por categoría</h2>
      <p className="muted">
        Inventario real de la sucursal seleccionada desde Neo4j.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label>Sucursal: </label>
        <select
          value={supermercadoId}
          onChange={(e) => setSupermercadoId(e.target.value)}
        >
          {supermercados.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted">Cargando inventario...</p>
      ) : (
        <div className="inventory-grid">
          {categorias.map(({ category, items }) => (
            <section className="category-card" key={category}>
              <h3>{category}</h3>
              <div className="category-items">
                {items.map((item) => (
                  <div className="product-row" key={item.id}>
                    <span>{item.nombre}</span>
                    <input
                      type="number"
                      min="0"
                      defaultValue={item.cantidad}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {categorias.length === 0 && (
            <p className="muted">No hay productos en esta sucursal.</p>
          )}
        </div>
      )}
    </div>
  );
}