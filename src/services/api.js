const BASE = "http://localhost:8000/api";

// ─── SERIALIZER ───────────────────────────────────────────────────────────────
// Neo4j a veces devuelve fechas como objetos {_Date__year, _Date__month, ...}
// en vez de strings. Esta función los convierte recursivamente a strings.
function sanitize(value) {
  if (value === null || value === undefined) return value;

  // Objeto de fecha de Neo4j
  if (typeof value === "object" && "_Date__year" in value) {
    const { _Date__year: y, _Date__month: m, _Date__day: d } = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // Objeto de datetime de Neo4j
  if (typeof value === "object" && "_DateTime__year" in value) {
    const { _DateTime__year: y, _DateTime__month: m, _DateTime__day: d } = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // Array
  if (Array.isArray(value)) return value.map(sanitize);

  // Objeto genérico — recursivo
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitize(v)])
    );
  }

  return value;
}

// ─── REQUEST ──────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  const data = await res.json();
  return sanitize(data);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser = (correo, password) =>
  request("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });

// ─── USUARIOS ─────────────────────────────────────────────────────────────────
export const getUsuarios = (params = {}) =>
  request("/usuarios/?" + new URLSearchParams(params));

export const getUsuario = (id) => request(`/usuarios/${id}`);

// ─── SUPERMERCADOS ────────────────────────────────────────────────────────────
export const getSupermercados = (params = {}) =>
  request("/supermercados/?" + new URLSearchParams(params));

export const getSupermercado = (id) => request(`/supermercados/${id}`);

export const getInventarioSupermercado = (id) =>
  request(`/supermercados/${id}/inventario`);

export const getUsuariosSupermercado = (id) =>
  request(`/supermercados/${id}/usuarios`);

export const getAgregadosSupermercados = () =>
  request("/supermercados/agregados");

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
export const getProductos = (params = {}) =>
  request("/productos/?" + new URLSearchParams(params));

export const getAgregadosProductos = () => request("/productos/agregados");

// ─── ALMACENES ────────────────────────────────────────────────────────────────
export const getAlmacenes = (params = {}) =>
  request("/almacenes/?" + new URLSearchParams(params));

export const getProductosAlmacen = (id, params = {}) =>
  request(`/almacenes/${id}/productos?` + new URLSearchParams(params));

export const getOrdenesAlmacen = (id, params = {}) =>
  request(`/almacenes/${id}/ordenes?` + new URLSearchParams(params));

// ─── ÓRDENES ──────────────────────────────────────────────────────────────────
export const getOrdenes = (params = {}) =>
  request("/ordenes/?" + new URLSearchParams(params));

export const getOrden = (id) => request(`/ordenes/${id}`);

export const getDetalleOrden = (id) => request(`/ordenes/${id}/detalle`);

export const getAgregadosOrdenes = () => request("/ordenes/agregados");

export const crearOrden = (body) =>
  request("/ordenes/", { method: "POST", body: JSON.stringify(body) });

// ─── TRANSPORTISTAS ───────────────────────────────────────────────────────────
export const getTransportistas = (params = {}) =>
  request("/transportistas/?" + new URLSearchParams(params));

export const asignarTransporte = (body) =>
  request("/transportistas/asignar-orden", {
    method: "POST",
    body: JSON.stringify(body),
  });