import { useEffect, useMemo, useState } from "react";
import { getAlmacenes, getProductosAlmacen, crearOrden } from "../../services/api";

export default function Ordenes({ user }) {
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenId, setAlmacenId] = useState("");
  const [productos, setProductos] = useState([]);
  const [urgencia, setUrgencia] = useState("normal");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Cargar almacenes activos
  useEffect(() => {
    getAlmacenes({ activo: true })
      .then((data) => {
        setAlmacenes(data);
        if (data.length > 0) setAlmacenId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Cargar productos del almacén seleccionado
  useEffect(() => {
    if (!almacenId) return;
    setLoadingProductos(true);
    setItems([]);
    getProductosAlmacen(almacenId)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoadingProductos(false));
  }, [almacenId]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [items]
  );

  const agregarProducto = (producto) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id && i.cantidad < producto.cantidad
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidadNueva) => {
    const cantidad = Number(cantidadNueva);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(cantidad, item.cantidad) }
          : item
      )
    );
  };

  const eliminarProducto = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const crearOrdenHandler = async () => {
    if (items.length === 0) return;

    // Necesitamos supermercado_id del usuario
    // Por ahora tomamos el primer supermercado disponible si el usuario no lo tiene
    console.log("USER EN ORDENES:", user);
    const supermercadoId = user?.supermercado_id;
    if (!supermercadoId) {
      alert("Tu usuario no tiene una sucursal asignada. Contacta al administrador.");
      return;
    }

    const body = {
      urgencia,
      estado: "pendiente",
      total: parseFloat(total.toFixed(2)),
      usuario_id: user.id,
      supermercado_id: supermercadoId,
      almacen_id: almacenId,
      items: items.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        descuento: 0,
        devolucion: false,
      })),
    };

    setLoading(true);
    try {
      const orden = await crearOrden(body);
      console.log("Orden creada, ID:", orden.id);
      alert("¡Orden creada exitosamente!");
      setItems([]);
    } catch (err) {
      alert("Error creando orden: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <p className="eyebrow">Órdenes</p>
      <h2>Crear solicitud de abastecimiento</h2>
      <p className="muted">
        Selecciona un almacén, agrega productos disponibles y genera una orden
        con estado pendiente.
      </p>

      <section className="order-config">
        <div>
          <label>Almacén proveedor</label>
          <select
            value={almacenId}
            onChange={(e) => setAlmacenId(e.target.value)}
          >
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} - {a.lugar}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Urgencia</label>
          <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </section>

      <section className="order-layout">
        <div className="products-panel">
          <h3>Productos disponibles</h3>

          {loadingProductos ? (
            <p className="muted">Cargando productos...</p>
          ) : (
            <div className="available-products">
              {productos.map((producto) => (
                <button
                  key={producto.id}
                  className="available-product"
                  onClick={() => agregarProducto(producto)}
                >
                  <strong>{producto.nombre}</strong>
                  <span>{producto.categoria}</span>
                  <small>
                    Q{producto.precio} | Stock: {producto.cantidad}
                  </small>
                </button>
              ))}
              {productos.length === 0 && (
                <p className="muted">No hay productos en este almacén.</p>
              )}
            </div>
          )}
        </div>

        <div className="summary-panel">
          <h3>Resumen de orden</h3>

          {items.length === 0 ? (
            <p className="muted">Aún no has agregado productos.</p>
          ) : (
            <div className="selected-items">
              {items.map((item) => (
                <div className="selected-row" key={item.id}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <span>Q{item.precio} c/u</span>
                  </div>

                  <input
                    type="number"
                    min="1"
                    max={item.cantidad}
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.id, e.target.value)}
                  />

                  <p>Q{(item.precio * item.cantidad).toFixed(2)}</p>

                  <button onClick={() => eliminarProducto(item.id)}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="order-total">
            <span>Total</span>
            <strong>Q{total.toFixed(2)}</strong>
          </div>

          <button
            className="create-order-btn"
            onClick={crearOrdenHandler}
            disabled={items.length === 0 || loading}
          >
            {loading ? "Creando..." : "Crear orden pendiente"}
          </button>
        </div>
      </section>
    </div>
  );
}