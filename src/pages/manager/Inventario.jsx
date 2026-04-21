import { useState } from "react";

const initialProducts = [
  {
    category: "Carnes",
    items: [
      { id: 1, name: "Corte de carne", quantity: 20 },
      { id: 2, name: "Pollo", quantity: 35 },
      { id: 3, name: "Carne molida", quantity: 18 },
      { id: 4, name: "Costilla", quantity: 12 },
      { id: 5, name: "Chuleta", quantity: 16 },
      { id: 6, name: "Filete de res", quantity: 10 },
    ],
  },
  {
    category: "Verduras",
    items: [
      { id: 7, name: "Papas", quantity: 50 },
      { id: 8, name: "Tomates", quantity: 42 },
      { id: 9, name: "Zanahorias", quantity: 30 },
      { id: 10, name: "Lechuga", quantity: 25 },
      { id: 11, name: "Cebolla", quantity: 38 },
      { id: 12, name: "Chile pimiento", quantity: 21 },
    ],
  },
  {
    category: "Frutas",
    items: [
      { id: 13, name: "Manzanas", quantity: 60 },
      { id: 14, name: "Bananos", quantity: 75 },
      { id: 15, name: "Naranjas", quantity: 45 },
      { id: 16, name: "Uvas", quantity: 22 },
      { id: 17, name: "Sandía", quantity: 12 },
      { id: 18, name: "Piña", quantity: 15 },
    ],
  },
  {
    category: "Lácteos",
    items: [
      { id: 19, name: "Leche", quantity: 80 },
      { id: 20, name: "Queso", quantity: 28 },
      { id: 21, name: "Yogurt", quantity: 36 },
      { id: 22, name: "Crema", quantity: 19 },
      { id: 23, name: "Mantequilla", quantity: 24 },
      { id: 24, name: "Queso crema", quantity: 14 },
    ],
  },
  {
    category: "Bebidas",
    items: [
      { id: 25, name: "Agua pura", quantity: 100 },
      { id: 26, name: "Jugos", quantity: 44 },
      { id: 27, name: "Gaseosas", quantity: 70 },
      { id: 28, name: "Té frío", quantity: 33 },
      { id: 29, name: "Bebida energética", quantity: 20 },
      { id: 30, name: "Café frío", quantity: 18 },
    ],
  },
  {
    category: "Limpieza",
    items: [
      { id: 31, name: "Jabón líquido", quantity: 24 },
      { id: 32, name: "Cloro", quantity: 18 },
      { id: 33, name: "Desinfectante", quantity: 20 },
      { id: 34, name: "Toallas", quantity: 40 },
      { id: 35, name: "Detergente", quantity: 32 },
      { id: 36, name: "Esponjas", quantity: 26 },
    ],
  },
];

export default function Inventario() {
  const [categories, setCategories] = useState(initialProducts);

  const updateQuantity = (categoryName, productId, value) => {
    const newQuantity = Number(value);

    setCategories((prev) =>
      prev.map((category) =>
        category.category === categoryName
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            }
          : category
      )
    );

    // CUANDO HAYA BACKEND:
    // Aquí se conectaría la actualización real de inventario.
    //
    // await fetch(`/api/sucursales/:id/productos/${productId}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ quantity: newQuantity }),
    // });
  };

  return (
    <div className="inventory-page">
      <p className="eyebrow">Inventario</p>
      <h2>Productos por categoría</h2>
      <p className="muted">
        Actualiza temporalmente la cantidad de productos de esta sucursal.
      </p>

      {/* CUANDO HAYA BACKEND:
        Quitas initialProducts y cargas los productos reales con:
        GET /api/sucursales/:id/productos
      */}

      <div className="inventory-grid">
        {categories.map((category) => (
          <section className="category-card" key={category.category}>
            <h3>{category.category}</h3>

            <div className="category-items">
              {category.items.map((item) => (
                <div className="product-row" key={item.id}>
                  <span>{item.name}</span>

                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(category.category, item.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}