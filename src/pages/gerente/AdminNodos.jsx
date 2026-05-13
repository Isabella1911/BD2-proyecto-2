import { useState } from "react";
import {
  getUsuarios,
  getProductos,
  getAlmacenes,
  getSupermercados,
  getTransportistas,
  getOrdenes,

  crearUsuario,
  crearProducto,
  crearAlmacen,
  crearSupermercado,
  crearTransportista,
  crearOrden,

  actualizarUsuario,
  actualizarProducto,
  actualizarAlmacen,
  actualizarSupermercado,
  actualizarTransportista,
  actualizarOrden,

  eliminarUsuario,
  eliminarProducto,
  eliminarAlmacen,
  eliminarSupermercado,
  eliminarTransportista,
  eliminarOrden,

  eliminarUsuariosBulk,
  eliminarProductosBulk,
  eliminarAlmacenesBulk,
  eliminarSupermercadosBulk,
  eliminarTransportistasBulk,
  eliminarOrdenesBulk,

  actualizarPropiedadesUsuariosBulk,
  actualizarPropiedadesProductosBulk,
  actualizarPropiedadesAlmacenesBulk,
  actualizarPropiedadesSupermercadosBulk,
  actualizarPropiedadesTransportistasBulk,
  actualizarPropiedadesOrdenesBulk,

  agregarPropiedadesUsuariosBulk,
  agregarPropiedadesProductosBulk,
  agregarPropiedadesAlmacenesBulk,
  agregarPropiedadesSupermercadosBulk,
  agregarPropiedadesTransportistasBulk,
  agregarPropiedadesOrdenesBulk,

  eliminarPropiedadesUsuariosBulk,
  eliminarPropiedadesProductosBulk,
  eliminarPropiedadesAlmacenesBulk,
  eliminarPropiedadesSupermercadosBulk,
  eliminarPropiedadesTransportistasBulk,
  eliminarPropiedadesOrdenesBulk,
} from "../../services/api";

// ─── Configuración de tipos de nodo ──────────────────────────────────────────
const NODO_CONFIG = {
  Usuario: {
    listar: (f) => getUsuarios(f),
    crear1Label: (b) => crearUsuario(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarUsuario(id, b),
    eliminar: (id) => eliminarUsuario(id),
    eliminarBulk: (ids) => eliminarUsuariosBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesUsuariosBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesUsuariosBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesUsuariosBulk(ids, k),
    campos: [
      { key: "nombre", label: "Nombre", type: "text" },
      { key: "correo", label: "Correo", type: "email" },
      { key: "password", label: "Password", type: "text" },
      { key: "rol", label: "Rol", type: "select", options: ["Manager", "Gerente"] },
      { key: "activo", label: "Activo", type: "boolean" },
    ],
    filtros: [
      { key: "rol", label: "Rol", type: "select", options: ["", "Manager", "Gerente"] },
    ],
  },

  Almacen: {
    listar: (f) => getAlmacenes(f),
    crear1Label: (b) => crearAlmacen(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarAlmacen(id, b),
    eliminar: (id) => eliminarAlmacen(id),
    eliminarBulk: (ids) => eliminarAlmacenesBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesAlmacenesBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesAlmacenesBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesAlmacenesBulk(ids, k),
    campos: [
      { key: "nombre", label: "Nombre", type: "text" },
      { key: "lugar", label: "Lugar", type: "text" },
      { key: "capacidad", label: "Capacidad", type: "number" },
      { key: "tipos", label: "Tipos", type: "text" },
      { key: "fecha_apertura", label: "Fecha de apertura", type: "date" },
      { key: "activo", label: "Activo", type: "boolean" },
    ],
    filtros: [
      { key: "lugar", label: "Lugar", type: "text" },
    ],
  },

  Supermercado: {
    listar: (f) => getSupermercados(f),
    crear1Label: (b) => crearSupermercado(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarSupermercado(id, b),
    eliminar: (id) => eliminarSupermercado(id),
    eliminarBulk: (ids) => eliminarSupermercadosBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesSupermercadosBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesSupermercadosBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesSupermercadosBulk(ids, k),
    campos: [
      { key: "nombre", label: "Nombre", type: "text" },
      { key: "cadena", label: "Cadena", type: "text" },
      { key: "direccion", label: "Dirección", type: "text" },
      { key: "activo", label: "Activo", type: "boolean" },
    ],
    filtros: [
      { key: "cadena", label: "Cadena", type: "text" },
      { key: "activo", label: "Activo", type: "select", options: ["", "true", "false"] },
    ],
  },

  Transportista: {
    listar: (f) => getTransportistas(f),
    crear1Label: (b) => crearTransportista(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarTransportista(id, b),
    eliminar: (id) => eliminarTransportista(id),
    eliminarBulk: (ids) => eliminarTransportistasBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesTransportistasBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesTransportistasBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesTransportistasBulk(ids, k),
    campos: [
      { key: "nombre", label: "Nombre", type: "text" },
      { key: "flota", label: "Flota", type: "text" },
      { key: "transporte", label: "Tipo de transporte", type: "text" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "activo", label: "Activo", type: "boolean" },
    ],
    filtros: [
      { key: "transporte", label: "Tipo", type: "text" },
    ],
  },

  Producto: {
    listar: (f) => getProductos(f),
    crear1Label: (b) => crearProducto(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarProducto(id, b),
    eliminar: (id) => eliminarProducto(id),
    eliminarBulk: (ids) => eliminarProductosBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesProductosBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesProductosBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesProductosBulk(ids, k),
    campos: [
      { key: "nombre", label: "Nombre", type: "text" },
      { key: "precio", label: "Precio", type: "number" },
      { key: "peso", label: "Peso", type: "number" },
      { key: "categoria", label: "Categoría", type: "text" },
      { key: "fecha", label: "Fecha", type: "date" },
      { key: "disponible", label: "Disponible", type: "boolean" },
    ],
    filtros: [
      { key: "categoria", label: "Categoría", type: "text" },
    ],
  },

  Orden: {
    listar: (f) => getOrdenes(f),
    crear1Label: (b) => crearOrden(b),
    crear2Labels: null,
    actualizar: (id, b) => actualizarOrden(id, b),
    eliminar: (id) => eliminarOrden(id),
    eliminarBulk: (ids) => eliminarOrdenesBulk(ids),
    actualizarBulk: (ids, p) => actualizarPropiedadesOrdenesBulk(ids, p),
    agregarBulk: (ids, p) => agregarPropiedadesOrdenesBulk(ids, p),
    eliminarPropsBulk: (ids, k) => eliminarPropiedadesOrdenesBulk(ids, k),
    campos: [
      { key: "estado", label: "Estado", type: "select", options: ["Pendiente", "En proceso", "Completada", "Cancelada"] },
      { key: "urgencia", label: "Urgencia", type: "select", options: ["Normal", "Alta", "Crítica"] },
      { key: "total", label: "Total", type: "number" },
      { key: "fecha", label: "Fecha", type: "date" },
    ],
    filtros: [
      { key: "estado", label: "Estado", type: "select", options: ["", "Pendiente", "En proceso", "Completada", "Cancelada"] },
      { key: "urgencia", label: "Urgencia", type: "select", options: ["", "Normal", "Alta", "Crítica"] },
    ],
  },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminNodos() {
  const [tipoNodo, setTipoNodo] = useState("Usuario");
  const [subTab, setSubTab] = useState("crear");
  const [nodos, setNodos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [form, setForm] = useState({});
  const [filtros, setFiltros] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Para edición — editNodo es el nodo actualmente en edición,
  // editIndex es el índice dentro de los nodos seleccionados
  const [editNodo, setEditNodo] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editIndex, setEditIndex] = useState(0);

  const [bulkPropKey, setBulkPropKey] = useState("");
  const [bulkPropVal, setBulkPropVal] = useState("");
  const [bulkPropKeys, setBulkPropKeys] = useState("");
  const [bulkAccion, setBulkAccion] = useState("actualizar");

  const cfg = NODO_CONFIG[tipoNodo];

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── Nodos seleccionados con sus datos completos ───────────────────────────
  // Filtramos la lista de nodos cargados por los ids seleccionados
  const nodosEnEdicion = nodos.filter((n) => seleccionados.includes(n.id));

  // ── Helpers de formulario ─────────────────────────────────────────────────
  const buildFormFromNodo = (nodo) => {
    const f = {};
    cfg.campos.forEach((c) => {
      f[c.key] = nodo[c.key] !== undefined ? String(nodo[c.key]) : "";
    });
    return f;
  };

  const buildBodyFromForm = (sourceForm) => {
    const body = {};

    cfg.campos.forEach((c) => {
      let value = sourceForm[c.key];

      if (c.type === "boolean") {
        body[c.key] = value === undefined
          ? true
          : value === "true" || value === true;
        return;
      }

      if (c.type === "number") {
        if (value !== undefined && value !== "") {
          const parsed = parseFloat(value);
          if (!Number.isNaN(parsed)) {
            body[c.key] = parsed;
          }
        }
        return;
      }

      if (c.type === "select") {
        if (value !== undefined && value !== "") {
          body[c.key] = value;
        } else if (c.options?.length > 0) {
          const firstValidOption = c.options.find((option) => option !== "");
          if (firstValidOption) {
            body[c.key] = firstValidOption;
          }
        }
        return;
      }

      if (value !== undefined && value !== "") {
        body[c.key] = value;
      }
    });

    if (tipoNodo === "Producto" && !body.fecha) {
      body.fecha = new Date().toISOString().slice(0, 10);
    }
    if (tipoNodo === "Usuario" && !body.rol) {
      body.rol = "Manager";
    }
    if (tipoNodo === "Orden" && !body.estado) {
      body.estado = "Pendiente";
    }
    if (tipoNodo === "Orden" && !body.urgencia) {
      body.urgencia = "Normal";
    }
    if (tipoNodo === "Almacen" && !body.fecha_apertura) {
      body.fecha_apertura = new Date().toISOString().slice(0, 10);
    }
    if (tipoNodo === "Almacen" && !body.tipos) {
      body.tipos = "General";
    }

    return body;
  };

  // ── Listar ────────────────────────────────────────────────────────────────
  const handleListar = async () => {
    setLoading(true);

    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== "" && v !== undefined)
      );

      const data = await cfg.listar(params);

      setNodos(Array.isArray(data) ? data : data.items ?? []);
      setSeleccionados([]);
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  // ── Crear ─────────────────────────────────────────────────────────────────
  const handleCrear = async () => {
    setLoading(true);

    try {
      const body = buildBodyFromForm(form);
      await cfg.crear1Label(body);
      flash(`✓ ${tipoNodo} creado correctamente`);
      setForm({});
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  // ── Editar 1 nodo ─────────────────────────────────────────────────────────
  const handleEditar = async () => {
    if (!editNodo) {
      flash("Selecciona un nodo primero", false);
      return;
    }

    setLoading(true);

    try {
      const body = buildBodyFromForm(editForm);
      await cfg.actualizar(editNodo.id, body);
      flash("✓ Nodo actualizado");

      // Actualizar el nodo en la lista local también
      setNodos((prev) =>
        prev.map((n) => (n.id === editNodo.id ? { ...n, ...body } : n))
      );
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  // ── Navegar entre nodos seleccionados en edición ──────────────────────────
  const irANodoEdicion = (index) => {
    const nodo = nodosEnEdicion[index];
    if (!nodo) return;
    setEditIndex(index);
    setEditNodo(nodo);
    setEditForm(buildFormFromNodo(nodo));
  };

  // ── Abrir edición desde botón en tabla (solo ese nodo) ────────────────────
  // Selecciona el nodo clicado (si no estaba seleccionado, lo agrega a seleccionados
  // y va a la pestaña de editar apuntando a él)
  const abrirEdicion = (nodo) => {
    // Asegurar que el nodo esté en seleccionados
    setSeleccionados((prev) =>
      prev.includes(nodo.id) ? prev : [...prev, nodo.id]
    );

    // Calcular el índice dentro de nodosEnEdicion DESPUÉS de agregar el nodo
    // Como el estado aún no se actualizó, calculamos manualmente
    const nuevosSeleccionados = seleccionados.includes(nodo.id)
      ? seleccionados
      : [...seleccionados, nodo.id];

    const nodosConDatos = nodos.filter((n) => nuevosSeleccionados.includes(n.id));
    const idx = nodosConDatos.findIndex((n) => n.id === nodo.id);

    setEditIndex(idx >= 0 ? idx : 0);
    setEditNodo(nodo);
    setEditForm(buildFormFromNodo(nodo));
    setSubTab("editar");
  };

  // ── Eliminar 1 nodo ───────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este nodo? Esta acción no se puede deshacer.")) return;

    setLoading(true);

    try {
      await cfg.eliminar(id);
      flash("✓ Nodo eliminado");
      setNodos((prev) => prev.filter((n) => n.id !== id));
      setSeleccionados((prev) => prev.filter((x) => x !== id));
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const handleBulk = async () => {
    if (seleccionados.length === 0) {
      flash("Selecciona al menos un nodo", false);
      return;
    }

    setLoading(true);

    try {
      const ids = seleccionados;

      if (bulkAccion === "eliminar") {
        if (!confirm(`¿Eliminar ${ids.length} nodo(s)? Esta acción no se puede deshacer.`)) {
          setLoading(false);
          return;
        }

        await cfg.eliminarBulk(ids);
        flash(`✓ ${ids.length} nodo(s) eliminados`);
        setNodos((prev) => prev.filter((n) => !ids.includes(n.id)));
        setSeleccionados([]);
      } else if (bulkAccion === "actualizar" || bulkAccion === "agregar") {
        if (!bulkPropKey) {
          flash("Ingresa el nombre de la propiedad", false);
          setLoading(false);
          return;
        }

        const properties = { [bulkPropKey]: bulkPropVal };
        const fn = bulkAccion === "actualizar" ? cfg.actualizarBulk : cfg.agregarBulk;

        await fn(ids, properties);

        flash(
          `✓ Propiedad "${bulkPropKey}" ${
            bulkAccion === "actualizar" ? "actualizada" : "agregada"
          } en ${ids.length} nodo(s)`
        );
      } else if (bulkAccion === "eliminar-props") {
        if (!bulkPropKeys) {
          flash("Ingresa las propiedades a eliminar", false);
          setLoading(false);
          return;
        }

        const property_keys = bulkPropKeys
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);

        await cfg.eliminarPropsBulk(ids, property_keys);
        flash(`✓ Propiedades eliminadas de ${ids.length} nodo(s)`);
      }
    } catch (e) {
      flash(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccionado = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === nodos.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(nodos.map((n) => n.id));
    }
  };

  // ── Ir a pestaña de editar desde Listar (con los seleccionados) ───────────
  const irAEditarSeleccionados = () => {
    if (seleccionados.length === 0) {
      flash("Selecciona al menos un nodo para editar", false);
      return;
    }

    const primero = nodosEnEdicion[0];
    if (primero) {
      setEditIndex(0);
      setEditNodo(primero);
      setEditForm(buildFormFromNodo(primero));
    }

    setSubTab("editar");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-nodos">
      {msg && (
        <div className={`flash-msg ${msg.ok ? "flash-ok" : "flash-err"}`}>
          {msg.text}
        </div>
      )}

      <div className="an-tipo-selector">
        {Object.keys(NODO_CONFIG).map((t) => (
          <button
            key={t}
            className={tipoNodo === t ? "active" : ""}
            onClick={() => {
              setTipoNodo(t);
              setNodos([]);
              setSeleccionados([]);
              setEditNodo(null);
              setEditIndex(0);
              setForm({});
              setFiltros({});
              setSubTab("crear");
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="an-subtabs">
        {["crear", "listar", "editar", "eliminar", "bulk"].map((t) => (
          <button
            key={t}
            className={subTab === t ? "active" : ""}
            onClick={() => {
              // Al ir a editar manualmente desde la tab, cargar el primero seleccionado
              if (t === "editar" && nodosEnEdicion.length > 0 && !editNodo) {
                const primero = nodosEnEdicion[0];
                setEditIndex(0);
                setEditNodo(primero);
                setEditForm(buildFormFromNodo(primero));
              }
              setSubTab(t);
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── CREAR ─────────────────────────────────────────────────────────── */}
      {subTab === "crear" && (
        <div className="an-panel">
          <h3>Crear {tipoNodo}</h3>

          {cfg.campos.map((c) => (
            <div key={c.key} className="an-field">
              <label>{c.label}</label>

              {c.type === "select" ? (
                <select
                  value={form[c.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                >
                  {c.options.map((o) => (
                    <option key={o} value={o}>
                      {o || "— selecciona —"}
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

          <button className="an-btn-primary" disabled={loading} onClick={handleCrear}>
            {loading ? "Creando..." : `Crear ${tipoNodo}`}
          </button>
        </div>
      )}

      {/* ── LISTAR ────────────────────────────────────────────────────────── */}
      {subTab === "listar" && (
        <div className="an-panel">
          <h3>Listar y filtrar {tipoNodo}s</h3>

          <div className="an-filtros">
            {cfg.filtros.map((f) => (
              <div key={f.key} className="an-field an-field-inline">
                <label>{f.label}</label>

                {f.type === "select" ? (
                  <select
                    value={filtros[f.key] ?? ""}
                    onChange={(e) => setFiltros({ ...filtros, [f.key]: e.target.value })}
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o || "Todos"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={f.label}
                    value={filtros[f.key] ?? ""}
                    onChange={(e) => setFiltros({ ...filtros, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <button className="an-btn-primary" onClick={handleListar} disabled={loading}>
              {loading ? "Cargando..." : "Buscar"}
            </button>
          </div>

          {nodos.length > 0 && (
            <div className="an-table-wrap">
              {/* Botón para editar los seleccionados */}
              {seleccionados.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <button
                    className="an-btn-primary"
                    onClick={irAEditarSeleccionados}
                  >
                    ✏️ Editar {seleccionados.length} seleccionado(s)
                  </button>
                </div>
              )}

              <table className="an-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={toggleTodos}
                        checked={seleccionados.length === nodos.length && nodos.length > 0}
                      />
                    </th>
                    <th>ID</th>
                    {cfg.campos.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {nodos.map((n) => (
                    <tr key={n.id} className={seleccionados.includes(n.id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(n.id)}
                          onChange={() => toggleSeleccionado(n.id)}
                        />
                      </td>

                      <td className="an-id">{n.id?.slice(0, 8)}...</td>

                      {cfg.campos.map((c) => (
                        <td key={c.key}>{String(n[c.key] ?? "—")}</td>
                      ))}

                      <td>
                        <button className="an-btn-sm" onClick={() => abrirEdicion(n)}>
                          Editar
                        </button>

                        <button
                          className="an-btn-sm an-btn-danger"
                          onClick={() => handleEliminar(n.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="an-count">
                {nodos.length} resultado(s) · {seleccionados.length} seleccionado(s)
              </p>
            </div>
          )}

          {nodos.length === 0 && !loading && (
            <p className="an-empty">Haz clic en "Buscar" para cargar los nodos.</p>
          )}
        </div>
      )}

      {/* ── EDITAR ────────────────────────────────────────────────────────── */}
      {subTab === "editar" && (
        <div className="an-panel">
          <h3>Editar {tipoNodo}</h3>

          {nodosEnEdicion.length === 0 ? (
            <p className="an-empty">
              Ve a <strong>Listar</strong>, busca los nodos, selecciona uno o varios con el
              checkbox y haz clic en <strong>Editar</strong>.
            </p>
          ) : (
            <>
              {/* Navegación entre nodos seleccionados */}
              {nodosEnEdicion.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="an-hint" style={{ margin: 0 }}>
                    Nodo {editIndex + 1} de {nodosEnEdicion.length} seleccionados
                  </span>

                  <button
                    className="an-btn-secondary"
                    onClick={() => irANodoEdicion(editIndex - 1)}
                    disabled={editIndex === 0}
                  >
                    ← Anterior
                  </button>

                  <button
                    className="an-btn-secondary"
                    onClick={() => irANodoEdicion(editIndex + 1)}
                    disabled={editIndex === nodosEnEdicion.length - 1}
                  >
                    Siguiente →
                  </button>

                  {/* Mini lista de seleccionados para saltar directamente */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {nodosEnEdicion.map((n, i) => (
                      <button
                        key={n.id}
                        onClick={() => irANodoEdicion(i)}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          background: i === editIndex ? "#d94145" : "#f5f5f5",
                          color: i === editIndex ? "white" : "#333",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                        title={n.id}
                      >
                        #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editNodo && (
                <>
                  <p className="an-id-label">
                    Editando: <code>{editNodo.id}</code>
                  </p>

                  {cfg.campos.map((c) => (
                    <div key={c.key} className="an-field">
                      <label>{c.label}</label>

                      {c.type === "boolean" ? (
                        <select
                          value={editForm[c.key] ?? "true"}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [c.key]: e.target.value })
                          }
                        >
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      ) : c.type === "select" ? (
                        <select
                          value={editForm[c.key] ?? ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [c.key]: e.target.value })
                          }
                        >
                          {c.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={c.type}
                          value={editForm[c.key] ?? ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [c.key]: e.target.value })
                          }
                        />
                      )}
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      className="an-btn-primary"
                      onClick={handleEditar}
                      disabled={loading}
                    >
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </button>

                    {/* Si hay más nodos, guardar y pasar al siguiente */}
                    {nodosEnEdicion.length > 1 &&
                      editIndex < nodosEnEdicion.length - 1 && (
                        <button
                          className="an-btn-secondary"
                          onClick={async () => {
                            await handleEditar();
                            irANodoEdicion(editIndex + 1);
                          }}
                          disabled={loading}
                        >
                          Guardar y siguiente →
                        </button>
                      )}

                    <button
                      className="an-btn-secondary"
                      onClick={() => setSubTab("listar")}
                    >
                      Volver a Listar
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ELIMINAR ──────────────────────────────────────────────────────── */}
      {subTab === "eliminar" && (
        <div className="an-panel">
          <h3>Eliminar {tipoNodo}</h3>

          <p className="an-hint">
            Ve a <strong>Listar</strong> para buscar nodos. Usa el botón{" "}
            <strong>Eliminar</strong> en la tabla para eliminar 1 nodo, o selecciona varios
            y ve a <strong>Bulk</strong> para eliminar múltiples.
          </p>

          <button className="an-btn-primary" onClick={() => setSubTab("listar")}>
            Ir a Listar
          </button>
        </div>
      )}

      {/* ── BULK ──────────────────────────────────────────────────────────── */}
      {subTab === "bulk" && (
        <div className="an-panel">
          <h3>Operaciones masivas en {tipoNodo}s</h3>

          <p className="an-hint">
            Primero ve a <strong>Listar</strong> y selecciona nodos con el checkbox. Luego
            regresa aquí.
          </p>

          <p className="an-count">{seleccionados.length} nodo(s) seleccionado(s)</p>

          <div className="an-field">
            <label>Acción</label>
            <select value={bulkAccion} onChange={(e) => setBulkAccion(e.target.value)}>
              <option value="actualizar">Actualizar propiedad</option>
              <option value="agregar">Agregar propiedad nueva</option>
              <option value="eliminar-props">Eliminar propiedad(es)</option>
              <option value="eliminar">Eliminar nodos</option>
            </select>
          </div>

          {(bulkAccion === "actualizar" || bulkAccion === "agregar") && (
            <>
              <div className="an-field">
                <label>Nombre de la propiedad</label>
                <input
                  type="text"
                  placeholder="ej. activo"
                  value={bulkPropKey}
                  onChange={(e) => setBulkPropKey(e.target.value)}
                />
              </div>

              <div className="an-field">
                <label>Nuevo valor</label>
                <input
                  type="text"
                  placeholder="ej. true"
                  value={bulkPropVal}
                  onChange={(e) => setBulkPropVal(e.target.value)}
                />
              </div>
            </>
          )}

          {bulkAccion === "eliminar-props" && (
            <div className="an-field">
              <label>Propiedades a eliminar separadas por coma</label>
              <input
                type="text"
                placeholder="ej. activo, descripcion"
                value={bulkPropKeys}
                onChange={(e) => setBulkPropKeys(e.target.value)}
              />
            </div>
          )}

          <button
            className={`an-btn-primary ${bulkAccion === "eliminar" ? "an-btn-danger" : ""}`}
            onClick={handleBulk}
            disabled={loading || seleccionados.length === 0}
          >
            {loading ? "Procesando..." : `Ejecutar sobre ${seleccionados.length} nodo(s)`}
          </button>

          <button
            className="an-btn-secondary"
            style={{ marginLeft: 10 }}
            onClick={() => setSubTab("listar")}
          >
            Volver a Listar
          </button>
        </div>
      )}
    </div>
  );
}