import { useState } from "react";

const ordenesMock = [
  {
    id: "ORD-001",
    almacen: "Almacén Central",
    destino: "Sucursal Central",
    total: 850,
    urgencia: "Alta",
    estado: "Aprobada",
  },
  {
    id: "ORD-002",
    almacen: "Almacén Norte",
    destino: "Sucursal Central",
    total: 430,
    urgencia: "Normal",
    estado: "Pendiente",
  },
  {
    id: "ORD-003",
    almacen: "Almacén Central",
    destino: "Sucursal Central",
    total: 1200,
    urgencia: "Urgente",
    estado: "Aprobada",
  },
];

const transportistasMock = [
  {
    id: "T-001",
    nombre: "Carlos Méndez",
    transporte: "Camión refrigerado",
    rating: 4.8,
    activo: true,
    flota: "Flota Norte",
  },
  {
    id: "T-002",
    nombre: "María López",
    transporte: "Panel de carga",
    rating: 4.6,
    activo: true,
    flota: "Flota Central",
  },
  {
    id: "T-003",
    nombre: "José Ramírez",
    transporte: "Camión mediano",
    rating: 4.3,
    activo: true,
    flota: "Flota Sur",
  },
];

export default function Transporte() {
  const [ordenId, setOrdenId] = useState("");
  const [transportistaId, setTransportistaId] = useState("");
  const [costo, setCosto] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [ordenes, setOrdenes] = useState(ordenesMock);

  const ordenSeleccionada = ordenes.find((orden) => orden.id === ordenId);
  const transportistaSeleccionado = transportistasMock.find(
    (t) => t.id === transportistaId
  );

  const asignarTransporte = () => {
    if (!ordenId || !transportistaId || !costo || !ubicacion || !fechaEntrega) {
      alert("Completa todos los campos");
      return;
    }

    const asignacion = {
      ordenId,
      transportistaId,
      costo: Number(costo),
      ubicacion,
      fecha_entrega: fechaEntrega,
      estadoOrden: "En transporte",
    };

    console.log("Asignación de transporte:", asignacion);

    setOrdenes((prev) =>
      prev.map((orden) =>
        orden.id === ordenId ? { ...orden, estado: "En transporte" } : orden
      )
    );

    /*
      CUANDO HAYA BACKEND:

      1. Quitar ordenesMock y transportistasMock.

      2. Cargar órdenes aprobadas:
         GET /api/ordenes?estado=Aprobada

      3. Cargar transportistas activos:
         GET /api/transportistas?activo=true

      4. Asignar transporte:
         POST /api/ordenes/:id/transporte

      Body sugerido:
      {
        transportistaId,
        costo,
        ubicacion,
        fecha_entrega
      }

      5. Backend crea en Neo4j:
         (Orden)-[:TRANSPORTADA_POR {
           costo,
           ubicacion,
           fecha_entrega
         }]->(Transportista)

      6. Backend actualiza:
         Orden.estado = "En transporte"
    */

    alert("Transporte asignado en modo simulación");

    setOrdenId("");
    setTransportistaId("");
    setCosto("");
    setUbicacion("");
    setFechaEntrega("");
  };

  return (
    <div className="transport-page">
      <p className="eyebrow">Transporte</p>
      <h2>Organizar transporte de órdenes</h2>
      <p className="muted">
        Asigna un transportista activo a una orden aprobada o pendiente.
      </p>

      <section className="transport-layout">
        <div className="transport-panel">
          <h3>Órdenes disponibles</h3>

          <div className="transport-list">
            {ordenes
              .filter((orden) => orden.estado !== "En transporte")
              .map((orden) => (
                <button
                  key={orden.id}
                  className={ordenId === orden.id ? "transport-card active" : "transport-card"}
                  onClick={() => setOrdenId(orden.id)}
                >
                  <strong>{orden.id}</strong>
                  <span>{orden.almacen} → {orden.destino}</span>
                  <small>
                    Q{orden.total} | {orden.urgencia} | {orden.estado}
                  </small>
                </button>
              ))}
          </div>
        </div>

        <div className="transport-panel">
          <h3>Transportistas activos</h3>

          <div className="transport-list">
            {transportistasMock.map((transportista) => (
              <button
                key={transportista.id}
                className={
                  transportistaId === transportista.id
                    ? "transport-card active"
                    : "transport-card"
                }
                onClick={() => setTransportistaId(transportista.id)}
              >
                <strong>{transportista.nombre}</strong>
                <span>{transportista.transporte}</span>
                <small>
                  Rating {transportista.rating} | {transportista.flota}
                </small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="assignment-panel">
        <h3>Datos de asignación</h3>

        <div className="assignment-grid">
          <input
            type="number"
            placeholder="Costo del transporte"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />

          <input
            placeholder="Ubicación actual"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />

          <input
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div className="assignment-summary">
          <p>
            <strong>Orden:</strong>{" "}
            {ordenSeleccionada ? ordenSeleccionada.id : "No seleccionada"}
          </p>

          <p>
            <strong>Transportista:</strong>{" "}
            {transportistaSeleccionado
              ? transportistaSeleccionado.nombre
              : "No seleccionado"}
          </p>
        </div>

        <button className="assign-transport-btn" onClick={asignarTransporte}>
          Asignar transporte
        </button>
      </section>
    </div>
  );
}