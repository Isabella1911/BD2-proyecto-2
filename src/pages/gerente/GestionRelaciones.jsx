import { useState } from "react";
import {
  getUsuarios, getSupermercados, getProductos, getAlmacenes, getOrdenes, getTransportistas,
  crearAsignadoA, actualizarAsignadoA, eliminarAsignadoA, eliminarAsignadoABulk,
  crearSupervisa, actualizarSupervisa, eliminarSupervisa, eliminarSupervisaBulk,
  crearTieneInventario, actualizarTieneInventario, eliminarTieneInventario, eliminarTieneInventarioBulk,
  crearAlmacenadoEn, actualizarAlmacenadoEn, eliminarAlmacenadoEn, eliminarAlmacenadoEnBulk,
  asignarTransporte,
  crearRealizaPedido,
  actualizarRealizaPedido,
  eliminarRealizaPedido,
  eliminarRealizaPedidoBulk,
  crearDestinadaA,
  actualizarDestinadaA,
  eliminarDestinadaA,
  eliminarDestinadaABulk,

  crearIncluye,
  actualizarIncluye,
  eliminarIncluye,
  eliminarIncluyeBulk,

  crearDespacha,
  actualizarDespacha,
  eliminarDespacha,
  eliminarDespachaBulk,

  crearDistribuye,
  actualizarDistribuye,
  eliminarDistribuye,
  eliminarDistribuyeBulk,
} from "../../services/api";

// ─── Configuración de relaciones ─────────────────────────────────────────────
const REL_CONFIG = {
  ASIGNADO_A: {
    label: "ASIGNADO_A",
    descripcion: "(Usuario:Manager) → (Supermercado)",
    crear: (b) => crearAsignadoA(b),
    actualizar: (ids, p) => actualizarAsignadoA(ids, p),
    eliminar: (b) => eliminarAsignadoA(b.usuario_id, b.supermercado_id),
    eliminarBulk: (ids) => eliminarAsignadoABulk(ids),
    campos: [
      { key: "usuario_id", label: "Usuario ID", type: "text", source: "usuarios" },
      { key: "supermercado_id", label: "Supermercado ID", type: "text", source: "supermercados" },
      { key: "rol_en_sucursal", label: "Rol en sucursal", type: "text" },
      { key: "fecha_inicio", label: "Fecha inicio", type: "date" },
      { key: "activo", label: "Activo", type: "boolean" },
    ],
    propiedades: ["rol_en_sucursal", "fecha_inicio", "activo"],
  },
  SUPERVISA: {
  label: "SUPERVISA",
  descripcion: "(Usuario:Gerente) → (Supermercado)",
  crear: (b) => crearSupervisa(b),
  actualizar: (ids, p) => actualizarSupervisa(ids, p),
  eliminar: (b) => eliminarSupervisa(b.usuario_id, b.supermercado_id),
  eliminarBulk: (ids) => eliminarSupervisaBulk(ids),
  campos: [
    { key: "usuario_id", label: "Usuario ID", type: "text", source: "usuarios" },
    { key: "supermercado_id", label: "Supermercado ID", type: "text", source: "supermercados" },
    { key: "fecha_inicio", label: "Fecha inicio", type: "date" },
    { key: "activo", label: "Activo", type: "boolean" },
  ],
  propiedades: ["fecha_inicio", "activo"],
},
  TIENE_INVENTARIO: {
    label: "TIENE_INVENTARIO",
    descripcion: "(Supermercado) → (Producto)",
    crear: (b) => crearTieneInventario(b),
    actualizar: (ids, p) => actualizarTieneInventario(ids, p),
    eliminar: (b) => eliminarTieneInventario(b.supermercado_id, b.producto_id),
    eliminarBulk: (ids) => eliminarTieneInventarioBulk(ids),
    campos: [
      { key: "supermercado_id", label: "Supermercado ID", type: "text", source: "supermercados" },
      { key: "producto_id", label: "Producto ID", type: "text", source: "productos" },
      { key: "cantidad", label: "Cantidad", type: "number" },
      { key: "stock_minimo", label: "Stock mínimo", type: "number" },
      { key: "fecha_actualizacion", label: "Fecha actualización", type: "date" },
    ],
    propiedades: ["cantidad", "stock_minimo", "fecha_actualizacion"],
  },
  ALMACENADO_EN: {
    label: "ALMACENADO_EN",
    descripcion: "(Producto) → (Almacen)",
    crear: (b) => crearAlmacenadoEn(b),
    actualizar: (ids, p) => actualizarAlmacenadoEn(ids, p),
    eliminar: (b) => eliminarAlmacenadoEn(b.producto_id, b.almacen_id),
    eliminarBulk: (ids) => eliminarAlmacenadoEnBulk(ids),
    campos: [
      { key: "producto_id", label: "Producto ID", type: "text", source: "productos" },
      { key: "almacen_id", label: "Almacén ID", type: "text", source: "almacenes" },
      { key: "cantidad", label: "Cantidad", type: "number" },
      { key: "fecha_ingreso", label: "Fecha ingreso", type: "date" },
      { key: "ubicacion", label: "Ubicación", type: "text" },
    ],
    propiedades: ["cantidad", "fecha_ingreso", "ubicacion"],
  },
  REALIZA_PEDIDO: {
  label: "REALIZA_PEDIDO",
  descripcion: "(Usuario:Manager) → (Orden)",
  crear: (b) => crearRealizaPedido(b),
  actualizar: (ids, p) => actualizarRealizaPedido(ids, p),
  eliminar: (b) => eliminarRealizaPedido(b.usuario_id, b.orden_id),
  eliminarBulk: (ids) => eliminarRealizaPedidoBulk(ids),
  campos: [
    { key: "usuario_id", label: "Usuario ID", type: "text", source: "usuarios" },
    { key: "orden_id", label: "Orden ID", type: "text", source: "ordenes" },
    { key: "fecha_pedido", label: "Fecha pedido", type: "date" },
    { key: "aprobado", label: "Aprobado", type: "boolean" },
    { key: "ubicacion", label: "Ubicación", type: "text" },
  ],
  propiedades: ["fecha_pedido", "aprobado", "ubicacion"],
},
  DESTINADA_A: {
  label: "DESTINADA_A",
  descripcion: "(Orden) → (Supermercado)",
  crear: (b) => crearDestinadaA(b),
  actualizar: (ids, p) => actualizarDestinadaA(ids, p),
  eliminar: (b) => eliminarDestinadaA(b.orden_id, b.supermercado_id),
  eliminarBulk: (ids) => eliminarDestinadaABulk(ids),
  campos: [
    { key: "orden_id", label: "Orden ID", type: "text", source: "ordenes" },
    { key: "supermercado_id", label: "Supermercado ID", type: "text", source: "supermercados" },
    { key: "fecha_destino", label: "Fecha destino", type: "date" },
  ],
  propiedades: ["fecha_destino"],
},
  INCLUYE: {
  label: "INCLUYE",
  descripcion: "(Orden) → (Producto)",
  crear: (b) => crearIncluye(b),
  actualizar: (ids, p) => actualizarIncluye(ids, p),
  eliminar: (b) => eliminarIncluye(b.orden_id, b.producto_id),
  eliminarBulk: (ids) => eliminarIncluyeBulk(ids),
  campos: [
    { key: "orden_id", label: "Orden ID", type: "text", source: "ordenes" },
    { key: "producto_id", label: "Producto ID", type: "text", source: "productos" },
    { key: "cantidad", label: "Cantidad", type: "number" },
    { key: "precio_unitario", label: "Precio unitario", type: "number" },
    { key: "subtotal", label: "Subtotal", type: "number" },
    { key: "descuento", label: "Descuento", type: "number" },
    { key: "devolucion", label: "Devolución", type: "boolean" },
  ],
  propiedades: [
    "cantidad",
    "precio_unitario",
    "subtotal",
    "descuento",
    "devolucion",
  ],
},
  DESPACHA: {
  label: "DESPACHA",
  descripcion: "(Almacen) → (Orden)",
  crear: (b) => crearDespacha(b),
  actualizar: (ids, p) => actualizarDespacha(ids, p),
  eliminar: (b) => eliminarDespacha(b.almacen_id, b.orden_id),
  eliminarBulk: (ids) => eliminarDespachaBulk(ids),
  campos: [
    { key: "almacen_id", label: "Almacén ID", type: "text", source: "almacenes" },
    { key: "orden_id", label: "Orden ID", type: "text", source: "ordenes" },
    { key: "fecha_despacho", label: "Fecha despacho", type: "date" },
    { key: "prioridad", label: "Prioridad", type: "select", options: ["Baja", "Media", "Alta", "Urgente"] },
    { key: "encargado", label: "Encargado", type: "text" },
  ],
  propiedades: ["fecha_despacho", "prioridad", "encargado"],
},
  DISTRIBUYE: {
  label: "DISTRIBUYE",
  descripcion: "(Transportista) → (Almacen)",
  crear: (b) => crearDistribuye(b),
  actualizar: (ids, p) => actualizarDistribuye(ids, p),
  eliminar: (b) => eliminarDistribuye(b.transportista_id, b.almacen_id),
  eliminarBulk: (ids) => eliminarDistribuyeBulk(ids),
  campos: [
    { key: "transportista_id", label: "Transportista ID", type: "text", source: "transportistas" },
    { key: "almacen_id", label: "Almacén ID", type: "text", source: "almacenes" },
    { key: "zona", label: "Zona", type: "text" },
    { key: "activo", label: "Activo", type: "boolean" },
    { key: "calificacion", label: "Calificación", type: "number" },
  ],
  propiedades: ["zona", "activo", "calificacion"],
},
  
  TRANSPORTADA_POR: {
    label: "TRANSPORTADA_POR",
    descripcion: "(Orden) → (Transportista)",
    crear: (b) => asignarTransporte(b),
    actualizar: null,
    eliminar: null,
    eliminarBulk: null,
    campos: [
      { key: "orden_id", label: "Orden ID", type: "text", source: "ordenes" },
      { key: "transportista_id", label: "Transportista ID", type: "text", source: "transportistas" },
      { key: "costo", label: "Costo", type: "number" },
      { key: "ubicacion", label: "Ubicación", type: "text" },
      { key: "fecha_entrega", label: "Fecha entrega", type: "date" },
    ],
    propiedades: ["costo", "ubicacion", "fecha_entrega"],
  },
};

// ─── Fuentes de datos para los selectores ─────────────────────────────────────
const FUENTES = {
  usuarios: () => getUsuarios(),
  supermercados: () => getSupermercados(),
  productos: () => getProductos(),
  almacenes: () => getAlmacenes(),
  ordenes: () => getOrdenes(),
  transportistas: () => getTransportistas(),
};

function NombreFuente(nodo, fuente) {
  if (fuente === "usuarios") return `${nodo.nombre} (${nodo.rol})`;
  if (fuente === "supermercados") return `${nodo.nombre} - ${nodo.cadena}`;
  if (fuente === "productos") return `${nodo.nombre} (${nodo.categoria})`;
  if (fuente === "almacenes") return `${nodo.nombre} - ${nodo.lugar}`;
  if (fuente === "ordenes") return `Orden ${nodo.id?.slice(0, 8)} - ${nodo.estado}`;
  if (fuente === "transportistas") return `${nodo.nombre} (${nodo.flota})`;
  return nodo.nombre ?? nodo.id;
}

export default function GestionRelaciones() {
  const [tipoRel, setTipoRel] = useState("ASIGNADO_A");
  const [subTab, setSubTab] = useState("crear");
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fuentes, setFuentes] = useState({});
  const [fuentesCargadas, setFuentesCargadas] = useState({});

  // Para actualización de propiedades bulk
  const [bulkIds, setBulkIds] = useState("");
  const [bulkPropKey, setBulkPropKey] = useState("");
  const [bulkPropVal, setBulkPropVal] = useState("");
  const [bulkAccion, setBulkAccion] = useState("actualizar");

  const cfg = REL_CONFIG[tipoRel];

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  // Carga la fuente de datos para un campo con source
  const cargarFuente = async (fuente) => {
    if (fuentesCargadas[fuente]) return;
    try {
      const data = await FUENTES[fuente]();
      const arr = Array.isArray(data) ? data : data.items ?? [];
      setFuentes((prev) => ({ ...prev, [fuente]: arr }));
      setFuentesCargadas((prev) => ({ ...prev, [fuente]: true }));
    } catch {
      // silencioso
    }
  };

  const handleCrear = async () => {
    setLoading(true);
    try {
      const body = { ...form };
      cfg.campos.forEach((c) => {
        if (c.type === "boolean") body[c.key] = body[c.key] === "true" || body[c.key] === true;
        if (c.type === "number" && body[c.key] !== undefined) body[c.key] = parseFloat(body[c.key]);
      });
      await cfg.crear(body);
      flash(`✓ Relación ${tipoRel} creada`);
      setForm({});
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar esta relación?")) return;
    setLoading(true);
    try {
      await cfg.eliminar(form);
      flash("✓ Relación eliminada");
      setForm({});
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async () => {
    const ids = bulkIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return flash("Ingresa al menos un ID", false);
    setLoading(true);
    try {
      if (bulkAccion === "actualizar" && cfg.actualizar) {
        if (!bulkPropKey) return flash("Ingresa el nombre de la propiedad", false);
        await cfg.actualizar(ids, { [bulkPropKey]: bulkPropVal });
        flash(`✓ Propiedad "${bulkPropKey}" actualizada en relaciones que incluyen esos IDs`);
      } else if (bulkAccion === "eliminar" && cfg.eliminarBulk) {
        if (!confirm(`¿Eliminar relaciones con ${ids.length} IDs?`)) {
          setLoading(false);
          return;
        }
        await cfg.eliminarBulk(ids);
        flash(`✓ Relaciones eliminadas`);
        setBulkIds("");
      }
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-nodos">
      {msg && (
        <div className={`flash-msg ${msg.ok ? "flash-ok" : "flash-err"}`}>
          {msg.text}
        </div>
      )}

      {/* Selector tipo de relación */}
      <div className="an-tipo-selector" style={{ flexWrap: "wrap" }}>
        {Object.keys(REL_CONFIG).map((r) => (
          <button
            key={r}
            className={tipoRel === r ? "active" : ""}
            onClick={() => { setTipoRel(r); setForm({}); setSubTab("crear"); }}
          >
            {r}
          </button>
        ))}
      </div>

      <p className="an-hint" style={{ marginTop: 6 }}>{cfg.descripcion}</p>

      {/* Sub-tabs */}
      <div className="an-subtabs">
        {["crear", "editar", "eliminar", "bulk"].map((t) => (
          <button key={t} className={subTab === t ? "active" : ""} onClick={() => setSubTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── CREAR ── */}
      {subTab === "crear" && (
        <div className="an-panel">
          <h3>Crear relación {tipoRel}</h3>
          <p className="an-hint">
            Los campos con selector cargan nodos de la BD. Haz clic en el campo para ver las opciones.
          </p>

          {cfg.campos.map((c) => (
            <div key={c.key} className="an-field">
              <label>{c.label}</label>
              {c.source ? (
                <select
                  value={form[c.key] ?? ""}
                  onFocus={() => cargarFuente(c.source)}
                  onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                >
                  <option value="">— clic para cargar {c.source} —</option>
                  {(fuentes[c.source] ?? []).map((n) => (
                    <option key={n.id} value={n.id}>
                      {NombreFuente(n, c.source)}
                    </option>
                  ))}
                </select>
              ) : c.type === "boolean" ? (
                <select
                  value={form[c.key] ?? "true"}
                  onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              ) : c.type === "select" ? (
                <select
                  value={form[c.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                >
                  <option value="">— selecciona —</option>
                  {c.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={c.type}
                  placeholder={c.label}
                  value={form[c.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                />
              )}
            </div>
          ))}

          <button className="an-btn-primary" onClick={handleCrear} disabled={loading}>
            {loading ? "Creando..." : `Crear ${tipoRel}`}
          </button>
        </div>
      )}

      {/* ── EDITAR (actualizar 1 relación) ── */}
      {subTab === "editar" && (
        <div className="an-panel">
          <h3>Actualizar propiedades de 1 relación {tipoRel}</h3>
          {!cfg.actualizar ? (
            <p className="an-hint">Esta relación no soporta edición directa de propiedades.</p>
          ) : (
            <>
              <p className="an-hint">
                Ingresa los IDs de los nodos extremos para identificar la relación, y los nuevos valores.
              </p>

              {cfg.campos.map((c) => (
                <div key={c.key} className="an-field">
                  <label>{c.label}</label>
                  {c.source ? (
                    <select
                      value={form[c.key] ?? ""}
                      onFocus={() => cargarFuente(c.source)}
                      onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    >
                      <option value="">— clic para cargar {c.source} —</option>
                      {(fuentes[c.source] ?? []).map((n) => (
                        <option key={n.id} value={n.id}>{NombreFuente(n, c.source)}</option>
                      ))}
                    </select>
                  ) : c.type === "boolean" ? (
                    <select
                      value={form[c.key] ?? "true"}
                      onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : c.type === "select" ? (
                    <select
                      value={form[c.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    >
                      <option value="">— selecciona —</option>
                      {c.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.type}
                      placeholder={c.label}
                      value={form[c.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <button
                className="an-btn-primary"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    // Extraer solo propiedades (sin IDs de nodos)
                    const keys = cfg.campos.filter(c => !c.source).map(c => c.key);
                    const idKeys = cfg.campos.filter(c => c.source).map(c => c.key);
                    const ids = [form[idKeys[0]], form[idKeys[1]]].filter(Boolean);
                    const props = {};
                    keys.forEach(k => { if (form[k] !== undefined && form[k] !== "") props[k] = form[k]; });
                    await cfg.actualizar(ids, props);
                    flash("✓ Relación actualizada");
                  } catch (e) {
                    flash(e.message, false);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? "Guardando..." : "Actualizar relación"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── ELIMINAR 1 relación ── */}
      {subTab === "eliminar" && (
        <div className="an-panel">
          <h3>Eliminar relación {tipoRel}</h3>
          {!cfg.eliminar ? (
            <p className="an-hint">Esta relación no soporta eliminación directa desde aquí.</p>
          ) : (
            <>
              <p className="an-hint">Selecciona los nodos extremos para identificar la relación a eliminar.</p>
              {cfg.campos.filter(c => c.source).map((c) => (
                <div key={c.key} className="an-field">
                  <label>{c.label}</label>
                  <select
                    value={form[c.key] ?? ""}
                    onFocus={() => cargarFuente(c.source)}
                    onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                  >
                    <option value="">— clic para cargar {c.source} —</option>
                    {(fuentes[c.source] ?? []).map((n) => (
                      <option key={n.id} value={n.id}>{NombreFuente(n, c.source)}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button className="an-btn-primary an-btn-danger" onClick={handleEliminar} disabled={loading}>
                {loading ? "Eliminando..." : "Eliminar relación"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── BULK ── */}
      {subTab === "bulk" && (
        <div className="an-panel">
          <h3>Operaciones masivas en {tipoRel}</h3>
          <p className="an-hint">
            Ingresa IDs separados por coma. Para ASIGNADO_A, SUPERVISA y TIENE_INVENTARIO, los IDs son de los
            nodos destino (supermercados o productos).
          </p>

          <div className="an-field">
            <label>IDs (separados por coma)</label>
            <input
              type="text"
              placeholder="id1, id2, id3..."
              value={bulkIds}
              onChange={(e) => setBulkIds(e.target.value)}
            />
          </div>

          <div className="an-field">
            <label>Acción</label>
            <select value={bulkAccion} onChange={(e) => setBulkAccion(e.target.value)}>
              {cfg.actualizar && <option value="actualizar">Actualizar propiedad</option>}
              {cfg.eliminarBulk && <option value="eliminar">Eliminar relaciones</option>}
            </select>
          </div>

          {bulkAccion === "actualizar" && (
            <>
              <div className="an-field">
                <label>Propiedad</label>
                <select value={bulkPropKey} onChange={(e) => setBulkPropKey(e.target.value)}>
                  <option value="">— selecciona —</option>
                  {cfg.propiedades.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="an-field">
                <label>Nuevo valor</label>
                <input
                  type="text"
                  placeholder="nuevo valor"
                  value={bulkPropVal}
                  onChange={(e) => setBulkPropVal(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            className={`an-btn-primary ${bulkAccion === "eliminar" ? "an-btn-danger" : ""}`}
            onClick={handleBulk}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Ejecutar operación"}
          </button>
        </div>
      )}
    </div>
  );
}
