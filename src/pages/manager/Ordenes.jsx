import { useMemo, useState } from "react";

const almacenesMock = [
  {
    id: "alm-1",
    nombre: "Almacén Central",
    lugar: "Guatemala",
    productos: [
      { id: 1, nombre: "Corte de carne", categoria: "Carnes", precio: 35, stock: 80 },
      { id: 2, nombre: "Pollo", categoria: "Carnes", precio: 25, stock: 120 },
      { id: 3, nombre: "Papas", categoria: "Verduras", precio: 5, stock: 300 },
      { id: 4, nombre: "Tomates", categoria: "Verduras", precio: 6, stock: 200 },
    ],
  },
  {
    id: "alm-2",
    nombre: "Almacén Norte",
    lugar: "Mixco",
    productos: [
      { id: 5, nombre: "Leche", categoria: "Lácteos", precio: 8, stock: 150 },
      { id: 6, nombre: "Queso", categoria: "Lácteos", precio: 18, stock: 60 },
      { id: 7, nombre: "Agua pura", categoria: "Bebidas", precio: 4, stock: 400 },
      { id: 8, nombre: "Jugos", categoria: "Bebidas", precio: 7, stock: 90 },
    ],
  },
];

export default function Ordenes() {
  const [almacenId, setAlmacenId] = useState(almacenesMock[0].id);
  const [urgencia, setUrgencia] = useState("Normal");
  const [items, setItems] = useState([]);

  const almacenSeleccionado = almacenesMock.find((a) => a.id === almacenId);

  const productosDisponibles = almacenSeleccionado?.productos || [];

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [items]);

  const agregarProducto = (producto) => {
    setItems((prev) => {
      const existe = prev.find((item) => item.id === producto.id);

      if (existe) {
        return prev.map((item) =>
          item.id === producto.id && item.cantidad < producto.stock
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ];
    });
  };

  const cambiarCantidad = (id, cantidadNueva) => {
    const cantidad = Number(cantidadNueva);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: cantidad > item.stock ? item.stock : cantidad,
              subtotal: item.precio * cantidad,
            }
          : item
      )
    );
  };

  const eliminarProducto = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const crearOrden = () => {
    const nuevaOrden = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      total,
      urgencia,
      estado: "Pendiente",
      almacen: almacenSeleccionado.nombre,
      sucursalDestino: "Sucursal Central",
      items: items.map((item) => ({
        producto: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad,
      })),
    };

    console.log("Orden creada:", nuevaOrden);

    /*
      CUANDO HAYA BACKEND:

      1. Quitar almacenesMock.
      2. Cargar almacenes con:
         GET /api/almacenes

      3. Cargar productos del almacén seleccionado con:
         GET /api/almacenes/:id/productos

      4. Crear orden con:
         POST /api/ordenes

      En Neo4j el backend debería crear:
      (Manager)-[:REALIZA_PEDIDO]->(Orden)
      (Almacen)-[:DESPACHA]->(Orden)
      (Orden)-[:INCLUYE {cantidad, precio_unitario, subtotal}]->(Producto)
      (Orden)-[:DESTINADA_A]->(Supermercado)
    */

    alert("Orden creada en modo simulación");
    setItems([]);
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
            onChange={(e) => {
              setAlmacenId(e.target.value);
              setItems([]);
            }}
          >
            {almacenesMock.map((almacen) => (
              <option key={almacen.id} value={almacen.id}>
                {almacen.nombre} - {almacen.lugar}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Urgencia</label>
          <select
            value={urgencia}
            onChange={(e) => setUrgencia(e.target.value)}
          >
            <option>Normal</option>
            <option>Alta</option>
            <option>Urgente</option>
          </select>
        </div>
      </section>

      <section className="order-layout">
        <div className="products-panel">
          <h3>Productos disponibles</h3>

          <div className="available-products">
            {productosDisponibles.map((producto) => (
              <button
                key={producto.id}
                className="available-product"
                onClick={() => agregarProducto(producto)}
              >
                <strong>{producto.nombre}</strong>
                <span>{producto.categoria}</span>
                <small>Q{producto.precio} | Stock: {producto.stock}</small>
              </button>
            ))}
          </div>
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
                    max={item.stock}
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.id, e.target.value)}
                  />

                  <p>Q{item.precio * item.cantidad}</p>

                  <button onClick={() => eliminarProducto(item.id)}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="order-total">
            <span>Total</span>
            <strong>Q{total}</strong>
          </div>

          <button
            className="create-order-btn"
            onClick={crearOrden}
            disabled={items.length === 0}
          >
            Crear orden pendiente
          </button>
        </div>
      </section>
    </div>
  );
}