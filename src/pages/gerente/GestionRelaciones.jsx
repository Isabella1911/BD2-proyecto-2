import { useState } from "react";
import {
  getUsuarios, getSupermercados, getProductos, getAlmacenes, getOrdenes, getTransportistas,
  crearAsignadoA, actualizarAsignadoA, eliminarAsignadoA, eliminarAsignadoABulk,
  crearSupervisa, actualizarSupervisa, eliminarSupervisa, eliminarSupervisaBulk,
  crearTieneInventario, actualizarTieneInventario, eliminarTieneInventario, eliminarTieneInventarioBulk,
  crearAlmacenadoEn, actualizarAlmacenadoEn, eliminarAlmacenadoEn, eliminarAlmacenadoEnBulk,
  asignarTransporte,
  crearRealizaPedido, actualizarRealizaPedido, eliminarRealizaPedido, eliminarRealizaPedidoBulk,
  crearDestinadaA, actualizarDestinadaA, eliminarDestinadaA, eliminarDestinadaABulk,
  crearIncluye, actualizarIncluye, eliminarIncluye, eliminarIncluyeBulk,
  crearDespacha, actualizarDespacha, eliminarDespacha, eliminarDespachaBulk,
  crearDistribuye, actualizarDistribuye, eliminarDistribuye, eliminarDistribuyeBulk,
  agregarPropiedadesRelacion,
  getConectadosRelacion,
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
    // Para el selector visual en bulk:
    fuenteSource: "usuarios",       // qué lista cargar como fuente
    fuenteLabel: (n) => `${n.nombre} (${n.rol})`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` — ${n.extra}` : ""}`,
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
    fuenteSource: "usuarios",
    fuenteLabel: (n) => `${n.nombre} (${n.rol})`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` — ${n.extra}` : ""}`,
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
    fuenteSource: "supermercados",
    fuenteLabel: (n) => `${n.nombre} — ${n.cadena}`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` (${n.extra})` : ""}`,
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
    fuenteSource: "productos",
    fuenteLabel: (n) => `${n.nombre} (${n.categoria})`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` — ${n.extra}` : ""}`,
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
    fuenteSource: "usuarios",
    fuenteLabel: (n) => `${n.nombre} (${n.rol})`,
    destinoLabel: (n) => `Orden ${n.id?.slice(0, 8)} — ${n.nombre}${n.extra ? ` / ${n.extra}` : ""}`,
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
    fuenteSource: "ordenes",
    fuenteLabel: (n) => `Orden ${n.id?.slice(0, 8)} — ${n.estado}`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` — ${n.extra}` : ""}`,
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
    propiedades: ["cantidad", "precio_unitario", "subtotal", "descuento", "devolucion"],
    fuenteSource: "ordenes",
    fuenteLabel: (n) => `Orden ${n.id?.slice(0, 8)} — ${n.estado}`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` (${n.extra})` : ""}`,
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
    fuenteSource: "almacenes",
    fuenteLabel: (n) => `${n.nombre} — ${n.lugar}`,
    destinoLabel: (n) => `Orden ${n.id?.slice(0, 8)} — ${n.nombre}${n.extra ? ` / ${n.extra}` : ""}`,
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
    fuenteSource: "transportistas",
    fuenteLabel: (n) => `${n.nombre} (${n.flota})`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` — ${n.extra}` : ""}`,
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
    fuenteSource: "ordenes",
    fuenteLabel: (n) => `Orden ${n.id?.slice(0, 8)} — ${n.estado}`,
    destinoLabel: (n) => `${n.nombre}${n.extra ? ` (${n.extra})` : ""}`,
  },
};

// ─── Fuentes de datos ─────────────────────────────────────────────────────────
const FUENTES_FN = {
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

  // Bulk — acción
  const [bulkAccion, setBulkAccion] = useState("actualizar");
  const [bulkPropKey, setBulkPropKey] = useState("");
  const [bulkPropVal, setBulkPropVal] = useState("");
  const [nuevasPropiedades, setNuevasPropiedades] = useState([{ key: "", value: "" }]);

  // Bulk — selector visual: nodo fuente seleccionado + destinos cargados + destinos seleccionados
  const [bulkFuenteId, setBulkFuenteId] = useState("");
  const [destinos, setDestinos] = useState([]);
  const [destinosSeleccionados, setDestinosSeleccionados] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(false);

  const cfg = REL_CONFIG[tipoRel];

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const cargarFuente = async (fuente) => {
    if (fuentesCargadas[fuente]) return;
    try {
      const data = await FUENTES_FN[fuente]();
      const arr = Array.isArray(data) ? data : data.items ?? [];
      setFuentes((prev) => ({ ...prev, [fuente]: arr }));
      setFuentesCargadas((prev) => ({ ...prev, [fuente]: true }));
    } catch { /* silencioso */ }
  };

  // Cuando se selecciona un nodo fuente en el bulk, cargar sus destinos
  const handleSeleccionarFuente = async (fuenteId) => {
    setBulkFuenteId(fuenteId);
    setDestinos([]);
    setDestinosSeleccionados([]);
    if (!fuenteId) return;
    setLoadingDestinos(true);
    try {
      const data = await getConectadosRelacion(tipoRel, fuenteId);
      setDestinos(Array.isArray(data) ? data : []);
    } catch (e) {
      flash(`Error cargando destinos: ${e.message}`, false);
    } finally {
      setLoadingDestinos(false);
    }
  };

  const toggleDestino = (id) => {
    setDestinosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodosDestinos = () => {
    if (destinosSeleccionados.length === destinos.length) {
      setDestinosSeleccionados([]);
    } else {
      setDestinosSeleccionados(destinos.map((d) => d.id));
    }
  };

  // ── Crear ─────────────────────────────────────────────────────────────────
  const handleCrear = async () => {
    setLoading(true);
    try {
      const body = { ...form };
      cfg.campos.forEach((c) => {
        if (c.type === "boolean") {
          const val = body[c.key] ?? "true";
          body[c.key] = val === "true" || val === true;
        }
        if (c.type === "number" && body[c.key] !== undefined) {
          body[c.key] = parseFloat(body[c.key]);
        }
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

  // ── Eliminar 1 ────────────────────────────────────────────────────────────
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

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const handleBulk = async () => {
    const ids = destinosSeleccionados;
    if (ids.length === 0) return flash("Selecciona al menos un destino", false);
    setLoading(true);
    try {
      if (bulkAccion === "actualizar" && cfg.actualizar) {
        if (!bulkPropKey) return flash("Selecciona la propiedad a actualizar", false);
        await cfg.actualizar(ids, { [bulkPropKey]: bulkPropVal });
        flash(`✓ "${bulkPropKey}" actualizado en ${ids.length} relación(es)`);

      } else if (bulkAccion === "agregar") {
        const validas = nuevasPropiedades.filter((p) => p.key.trim() !== "");
        if (validas.length === 0) return flash("Ingresa al menos una propiedad", false);
        const properties = Object.fromEntries(validas.map((p) => [p.key.trim(), p.value]));
        await agregarPropiedadesRelacion(tipoRel, ids, properties);
        flash(`✓ ${validas.length} propiedad(es) agregada(s) a ${ids.length} relación(es)`);
        setNuevasPropiedades([{ key: "", value: "" }]);

      } else if (bulkAccion === "eliminar" && cfg.eliminarBulk) {
        if (!confirm(`¿Eliminar ${ids.length} relación(es)? Esta acción no se puede deshacer.`)) {
          setLoading(false);
          return;
        }
        await cfg.eliminarBulk(ids);
        flash(`✓ ${ids.length} relación(es) eliminada(s)`);
        setDestinosSeleccionados([]);
        setDestinos([]);
        setBulkFuenteId("");
      }
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  const agregarFilaProp = () =>
    setNuevasPropiedades((prev) => [...prev, { key: "", value: "" }]);
  const eliminarFilaProp = (i) =>
    setNuevasPropiedades((prev) => prev.filter((_, idx) => idx !== i));
  const actualizarFilaProp = (i, campo, valor) =>
    setNuevasPropiedades((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p))
    );

  const resetTipo = (r) => {
    setTipoRel(r);
    setForm({});
    setSubTab("crear");
    setBulkFuenteId("");
    setDestinos([]);
    setDestinosSeleccionados([]);
    setNuevasPropiedades([{ key: "", value: "" }]);
  };

  // ─────────────────────────────────────────────────────────────────────────
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
            onClick={() => resetTipo(r)}
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
          <p className="an-hint">Los campos con selector cargan nodos de la BD al hacer clic.</p>

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
                  {c.options.map((o) => (<option key={o} value={o}>{o}</option>))}
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

      {/* ── EDITAR ── */}
      {subTab === "editar" && (
        <div className="an-panel">
          <h3>Actualizar propiedades de 1 relación {tipoRel}</h3>
          {!cfg.actualizar ? (
            <p className="an-hint">Esta relación no soporta edición directa de propiedades.</p>
          ) : (
            <>
              <p className="an-hint">Selecciona los nodos extremos y edita los valores.</p>
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
                      {c.options.map((o) => (<option key={o} value={o}>{o}</option>))}
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
                    const idKeys = cfg.campos.filter((c) => c.source).map((c) => c.key);
                    const propKeys = cfg.campos.filter((c) => !c.source).map((c) => c.key);
                    const ids = [form[idKeys[0]], form[idKeys[1]]].filter(Boolean);
                    const props = {};
                    propKeys.forEach((k) => {
                      if (form[k] !== undefined && form[k] !== "") props[k] = form[k];
                    });
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

      {/* ── ELIMINAR 1 ── */}
      {subTab === "eliminar" && (
        <div className="an-panel">
          <h3>Eliminar relación {tipoRel}</h3>
          {!cfg.eliminar ? (
            <p className="an-hint">Esta relación no soporta eliminación directa desde aquí.</p>
          ) : (
            <>
              <p className="an-hint">Selecciona los nodos extremos para identificar la relación.</p>
              {cfg.campos.filter((c) => c.source).map((c) => (
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

          {/* PASO 1: Seleccionar nodo fuente */}
          <div className="an-field">
            <label>
              1. Selecciona el nodo fuente ({cfg.fuenteSource})
            </label>
            <select
              value={bulkFuenteId}
              onFocus={() => cargarFuente(cfg.fuenteSource)}
              onChange={(e) => handleSeleccionarFuente(e.target.value)}
            >
              <option value="">— clic para cargar {cfg.fuenteSource} —</option>
              {(fuentes[cfg.fuenteSource] ?? []).map((n) => (
                <option key={n.id} value={n.id}>{cfg.fuenteLabel(n)}</option>
              ))}
            </select>
          </div>

          {/* PASO 2: Lista de destinos conectados con checkboxes */}
          {bulkFuenteId && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                2. Selecciona los destinos conectados ({destinosSeleccionados.length} seleccionados)
              </label>

              {loadingDestinos ? (
                <p className="an-hint">Cargando destinos...</p>
              ) : destinos.length === 0 ? (
                <p className="an-hint">Este nodo no tiene relaciones {tipoRel} registradas.</p>
              ) : (
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                    padding: "4px 0",
                  }}
                >
                  {/* Seleccionar todos */}
                  <div
                    style={{
                      padding: "6px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#fafafa",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="sel-todos"
                      checked={destinosSeleccionados.length === destinos.length && destinos.length > 0}
                      onChange={toggleTodosDestinos}
                    />
                    <label htmlFor="sel-todos" style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      Seleccionar todos ({destinos.length})
                    </label>
                  </div>

                  {/* Filas de destinos */}
                  {destinos.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: "7px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        background: destinosSeleccionados.includes(d.id) ? "#fff4f4" : "white",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                      onClick={() => toggleDestino(d.id)}
                    >
                      <input
                        type="checkbox"
                        checked={destinosSeleccionados.includes(d.id)}
                        onChange={() => toggleDestino(d.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ flex: 1, fontSize: 14 }}>
                        {cfg.destinoLabel(d)}
                      </span>
                      <code style={{ fontSize: 11, color: "#999" }}>{d.id.slice(0, 8)}…</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Acción a ejecutar (solo si hay destinos seleccionados) */}
          {destinosSeleccionados.length > 0 && (
            <>
              <div className="an-field">
                <label>3. Acción a ejecutar sobre {destinosSeleccionados.length} relación(es)</label>
                <select value={bulkAccion} onChange={(e) => setBulkAccion(e.target.value)}>
                  {cfg.actualizar && <option value="actualizar">Actualizar propiedad existente</option>}
                  <option value="agregar">Agregar propiedad(es) nueva(s)</option>
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

              {bulkAccion === "agregar" && (
                <div style={{ marginBottom: 12 }}>
                  <p className="an-hint" style={{ marginBottom: 8 }}>
                    Se agregarán a las relaciones sin pisar valores existentes.
                  </p>
                  {nuevasPropiedades.map((prop, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}
                    >
                      <input
                        type="text"
                        placeholder="nombre propiedad"
                        value={prop.key}
                        onChange={(e) => actualizarFilaProp(i, "key", e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="valor"
                        value={prop.value}
                        onChange={(e) => actualizarFilaProp(i, "value", e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {nuevasPropiedades.length > 1 && (
                        <button className="an-btn-sm an-btn-danger" onClick={() => eliminarFilaProp(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="an-btn-secondary" onClick={agregarFilaProp}>
                    + Agregar otra propiedad
                  </button>
                </div>
              )}

              <button
                className={`an-btn-primary ${bulkAccion === "eliminar" ? "an-btn-danger" : ""}`}
                onClick={handleBulk}
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : `Ejecutar sobre ${destinosSeleccionados.length} relación(es)`}
              </button>
            </>
          )}

          {/* Hint si no se ha seleccionado nodo fuente todavía */}
          {!bulkFuenteId && (
            <p className="an-hint" style={{ marginTop: 8 }}>
              Selecciona un nodo fuente para ver sus relaciones {tipoRel} y operar sobre ellas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}