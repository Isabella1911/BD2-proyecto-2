const BASE = "http://localhost:8000/api";

// ─── SERIALIZER ───────────────────────────────────────────────────────────────
function sanitize(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "object" && "_Date__year" in value) {
    const { _Date__year: y, _Date__month: m, _Date__day: d } = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  if (typeof value === "object" && "_DateTime__year" in value) {
    const { _DateTime__year: y, _DateTime__month: m, _DateTime__day: d } = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  if (Array.isArray(value)) return value.map(sanitize);

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

    let message = `Error ${res.status}`;

    if (Array.isArray(err.detail)) {
      message = err.detail
        .map((e) => {
          const loc = Array.isArray(e.loc) ? e.loc.join(".") : "";
          return `${loc}: ${e.msg}`;
        })
        .join(" | ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    } else if (err.message) {
      message = err.message;
    }

    throw new Error(message);
  }

  const data = await res.json().catch(() => null);
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

export const crearUsuario = (body) =>
  request("/usuarios/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const crearUsuarioConLabel = (body) =>
  request("/usuarios/con-rol-label", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarUsuario = (id, body) =>
  request(`/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarUsuario = (id) =>
  request(`/usuarios/${id}`, {
    method: "DELETE",
  });

export const eliminarUsuariosBulk = (ids) =>
  request("/usuarios/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesUsuariosBulk = (ids, properties) =>
  request("/usuarios/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesUsuariosBulk = (ids, properties) =>
  request("/usuarios/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesUsuariosBulk = (ids, property_keys) =>
  request("/usuarios/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

export const getAgregadosUsuarios = () => request("/usuarios/agregados");

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

export const crearSupermercado = (body) =>
  request("/supermercados/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarSupermercado = (id, body) =>
  request(`/supermercados/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarSupermercado = (id) =>
  request(`/supermercados/${id}`, {
    method: "DELETE",
  });

export const eliminarSupermercadosBulk = (ids) =>
  request("/supermercados/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesSupermercadosBulk = (ids, properties) =>
  request("/supermercados/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesSupermercadosBulk = (ids, properties) =>
  request("/supermercados/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesSupermercadosBulk = (ids, property_keys) =>
  request("/supermercados/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
export const getProductos = (params = {}) =>
  request("/productos/?" + new URLSearchParams(params));

export const getProducto = (id) => request(`/productos/${id}`);

export const getAgregadosProductos = () => request("/productos/agregados");

export const crearProducto = (body) =>
  request("/productos/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarProducto = (id, body) =>
  request(`/productos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarProducto = (id) =>
  request(`/productos/${id}`, {
    method: "DELETE",
  });

export const eliminarProductosBulk = (ids) =>
  request("/productos/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesProductosBulk = (ids, properties) =>
  request("/productos/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesProductosBulk = (ids, properties) =>
  request("/productos/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesProductosBulk = (ids, property_keys) =>
  request("/productos/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ─── ALMACENES ────────────────────────────────────────────────────────────────
export const getAlmacenes = (params = {}) =>
  request("/almacenes/?" + new URLSearchParams(params));

export const getAlmacen = (id) => request(`/almacenes/${id}`);

export const getProductosAlmacen = (id, params = {}) =>
  request(`/almacenes/${id}/productos?` + new URLSearchParams(params));

export const getOrdenesAlmacen = (id, params = {}) =>
  request(`/almacenes/${id}/ordenes?` + new URLSearchParams(params));

export const getAgregadosAlmacenes = () => request("/almacenes/agregados");

export const crearAlmacen = (body) =>
  request("/almacenes/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarAlmacen = (id, body) =>
  request(`/almacenes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarAlmacen = (id) =>
  request(`/almacenes/${id}`, {
    method: "DELETE",
  });

export const eliminarAlmacenesBulk = (ids) =>
  request("/almacenes/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesAlmacenesBulk = (ids, properties) =>
  request("/almacenes/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesAlmacenesBulk = (ids, properties) =>
  request("/almacenes/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesAlmacenesBulk = (ids, property_keys) =>
  request("/almacenes/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ─── ÓRDENES ──────────────────────────────────────────────────────────────────
export const getOrdenes = (params = {}) =>
  request("/ordenes/?" + new URLSearchParams(params));

export const getOrden = (id) => request(`/ordenes/${id}`);

export const getDetalleOrden = (id) => request(`/ordenes/${id}/detalle`);

export const getAgregadosOrdenes = () => request("/ordenes/agregados");

export const crearOrden = (body) =>
  request("/ordenes/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarOrden = (id, body) =>
  request(`/ordenes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarOrden = (id) =>
  request(`/ordenes/${id}`, {
    method: "DELETE",
  });

export const eliminarOrdenesBulk = (ids) =>
  request("/ordenes/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesOrdenesBulk = (ids, properties) =>
  request("/ordenes/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesOrdenesBulk = (ids, properties) =>
  request("/ordenes/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesOrdenesBulk = (ids, property_keys) =>
  request("/ordenes/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ─── TRANSPORTISTAS ───────────────────────────────────────────────────────────
export const getTransportistas = (params = {}) =>
  request("/transportistas/?" + new URLSearchParams(params));

export const getTransportista = (id) => request(`/transportistas/${id}`);

export const getAgregadosTransportistas = () =>
  request("/transportistas/agregados");

export const crearTransportista = (body) =>
  request("/transportistas/", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarTransportista = (id, body) =>
  request(`/transportistas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const eliminarTransportista = (id) =>
  request(`/transportistas/${id}`, {
    method: "DELETE",
  });

export const eliminarTransportistasBulk = (ids) =>
  request("/transportistas/bulk/eliminar", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });

export const actualizarPropiedadesTransportistasBulk = (ids, properties) =>
  request("/transportistas/bulk/propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const agregarPropiedadesTransportistasBulk = (ids, properties) =>
  request("/transportistas/bulk/agregar-propiedades", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarPropiedadesTransportistasBulk = (ids, property_keys) =>
  request("/transportistas/bulk/propiedades", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

export const asignarTransporte = (body) =>
  request("/transportistas/asignar-orden", {
    method: "POST",
    body: JSON.stringify(body),
  });

// ─── RELACIONES ───────────────────────────────────────────────────────────────

// ASIGNADO_A (Usuario -> Supermercado)
export const crearAsignadoA = (body) =>
  request("/relaciones/asignado-a", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarAsignadoA = (ids, properties) =>
  request("/relaciones/asignado-a", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarAsignadoA = (usuario_id, supermercado_id) =>
  request(
    `/relaciones/asignado-a?usuario_id=${usuario_id}&supermercado_id=${supermercado_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarAsignadoABulk = (ids, property_keys = []) =>
  request("/relaciones/asignado-a/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// SUPERVISA (Usuario -> Supermercado)
export const crearSupervisa = (body) =>
  request("/relaciones/supervisa", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarSupervisa = (ids, properties) =>
  request("/relaciones/supervisa", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarSupervisa = (usuario_id, supermercado_id) =>
  request(
    `/relaciones/supervisa?usuario_id=${usuario_id}&supermercado_id=${supermercado_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarSupervisaBulk = (ids, property_keys = []) =>
  request("/relaciones/supervisa/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

export const actualizarSupervisaPorNombres = (
  nombres_supermercados,
  properties
) =>
  request("/relaciones/supervisa/por-nombres", {
    method: "PATCH",
    body: JSON.stringify({ nombres_supermercados, properties }),
  });

export const eliminarSupervisaBulkPorNombres = (nombres_supermercados) =>
  request("/relaciones/supervisa/bulk/por-nombres", {
    method: "DELETE",
    body: JSON.stringify({ nombres_supermercados }),
  });

// TIENE_INVENTARIO (Supermercado -> Producto)
export const crearTieneInventario = (body) =>
  request("/relaciones/tiene-inventario", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarTieneInventario = (ids, properties) =>
  request("/relaciones/tiene-inventario", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarTieneInventario = (supermercado_id, producto_id) =>
  request(
    `/relaciones/tiene-inventario?supermercado_id=${supermercado_id}&producto_id=${producto_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarTieneInventarioBulk = (ids, property_keys = []) =>
  request("/relaciones/tiene-inventario/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// REALIZA_PEDIDO (Usuario -> Orden)
export const crearRealizaPedido = (body) =>
  request("/relaciones/realiza-pedido", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarRealizaPedido = (ids, properties) =>
  request("/relaciones/realiza-pedido", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarRealizaPedido = (usuario_id, orden_id) =>
  request(
    `/relaciones/realiza-pedido?usuario_id=${usuario_id}&orden_id=${orden_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarRealizaPedidoBulk = (ids, property_keys = []) =>
  request("/relaciones/realiza-pedido/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// DESTINADA_A (Orden -> Supermercado)
export const crearDestinadaA = (body) =>
  request("/relaciones/destinada-a", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarDestinadaA = (ids, properties) =>
  request("/relaciones/destinada-a", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarDestinadaA = (orden_id, supermercado_id) =>
  request(
    `/relaciones/destinada-a?orden_id=${orden_id}&supermercado_id=${supermercado_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarDestinadaABulk = (ids, property_keys = []) =>
  request("/relaciones/destinada-a/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// INCLUYE (Orden -> Producto)
export const crearIncluye = (body) =>
  request("/relaciones/incluye", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarIncluye = (ids, properties) =>
  request("/relaciones/incluye", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarIncluye = (orden_id, producto_id) =>
  request(
    `/relaciones/incluye?orden_id=${orden_id}&producto_id=${producto_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarIncluyeBulk = (ids, property_keys = []) =>
  request("/relaciones/incluye/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// DESPACHA (Almacen -> Orden)
export const crearDespacha = (body) =>
  request("/relaciones/despacha", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarDespacha = (ids, properties) =>
  request("/relaciones/despacha", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarDespacha = (almacen_id, orden_id) =>
  request(
    `/relaciones/despacha?almacen_id=${almacen_id}&orden_id=${orden_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarDespachaBulk = (ids, property_keys = []) =>
  request("/relaciones/despacha/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// DISTRIBUYE (Transportista -> Almacen)
export const crearDistribuye = (body) =>
  request("/relaciones/distribuye", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarDistribuye = (ids, properties) =>
  request("/relaciones/distribuye", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarDistribuye = (transportista_id, almacen_id) =>
  request(
    `/relaciones/distribuye?transportista_id=${transportista_id}&almacen_id=${almacen_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarDistribuyeBulk = (ids, property_keys = []) =>
  request("/relaciones/distribuye/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ALMACENADO_EN (Producto -> Almacen)
export const crearAlmacenadoEn = (body) =>
  request("/relaciones/almacenado-en", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const actualizarAlmacenadoEn = (ids, properties) =>
  request("/relaciones/almacenado-en", {
    method: "PATCH",
    body: JSON.stringify({ ids, properties }),
  });

export const eliminarAlmacenadoEn = (producto_id, almacen_id) =>
  request(
    `/relaciones/almacenado-en?producto_id=${producto_id}&almacen_id=${almacen_id}`,
    {
      method: "DELETE",
    }
  );

export const eliminarAlmacenadoEnBulk = (ids, property_keys = []) =>
  request("/relaciones/almacenado-en/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids, property_keys }),
  });

// ─── CSV ──────────────────────────────────────────────────────────────────────
export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${BASE}/csv/upload`, {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then(sanitize);
};

export const getTemplateCSV = (tipo) =>
  fetch(`${BASE}/csv/template/${tipo}`).then((r) => r.text());