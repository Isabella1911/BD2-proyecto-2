export default function Sidebar({ section, setSection }) {
  const items = [
    { id: "inicio", label: "Resumen" },
    { id: "inventario", label: "Inventario" },
    { id: "ordenes", label: "Órdenes" },
    { id: "transporte", label: "Transporte" },
    { id: "historial", label: "Historial" },
  ];

  return (
    <aside className="manager-sidebar">
      <h2>Super Mart</h2>

      {items.map((item) => (
        <button
          key={item.id}
          className={section === item.id ? "active" : ""}
          onClick={() => setSection(item.id)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}