// ─── SUPERMERCADOS (Sedes) ────────────────────────────────────────────────────
export const supermercados = [
  { id: 'SM-001', cadena: 'HiperFresh', nombre: 'HiperFresh Zona 10', direccion: 'Av. Reforma 12-01, Zona 10', activo: true, ciudad: 'Guatemala City', encargado: 'Ana López', telefono: '+502 2220-1100', ordenes: 142, gasto_mensual: 287450.50 },
  { id: 'SM-002', cadena: 'HiperFresh', nombre: 'HiperFresh Zona 1', direccion: '6a Av. 13-20, Zona 1', activo: true, ciudad: 'Guatemala City', encargado: 'Carlos Méndez', telefono: '+502 2230-2200', ordenes: 98, gasto_mensual: 195000.00 },
  { id: 'SM-003', cadena: 'MarketPlus', nombre: 'MarketPlus Mixco', direccion: 'Calzada San Juan 4-15, Mixco', activo: true, ciudad: 'Mixco', encargado: 'Lucía Ramírez', telefono: '+502 2440-3300', ordenes: 75, gasto_mensual: 143200.75 },
  { id: 'SM-004', cadena: 'MarketPlus', nombre: 'MarketPlus Villa Nueva', direccion: '12 Av. 10-50, Villa Nueva', activo: false, ciudad: 'Villa Nueva', encargado: 'Pedro García', telefono: '+502 2560-4400', ordenes: 12, gasto_mensual: 22000.00 },
  { id: 'SM-005', cadena: 'FreshMart', nombre: 'FreshMart Antigua', direccion: 'Calle del Arco 5-20, Antigua', activo: true, ciudad: 'Antigua Guatemala', encargado: 'María Torres', telefono: '+502 7832-5500', ordenes: 63, gasto_mensual: 118750.00 },
  { id: 'SM-006', cadena: 'FreshMart', nombre: 'FreshMart Quetzaltenango', direccion: '14 Av. 3-70, Xela', activo: true, ciudad: 'Quetzaltenango', encargado: 'Jorge Pérez', telefono: '+502 7762-6600', ordenes: 55, gasto_mensual: 97300.25 },
];

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────
export const proveedores = [
  { id: 'PRV-001', nombre: 'AgroFresh S.A.', pais: 'Guatemala', rating: 4.8, categoria: 'Frutas & Verduras', fecha_registro: '2020-03-15', licencia: true, contacto: 'Roberto Herrera', email: 'r.herrera@agrofresh.gt', productos: 48, monto_mensual: 95000 },
  { id: 'PRV-002', nombre: 'LácteosCentro', pais: 'Guatemala', rating: 4.5, categoria: 'Lácteos', fecha_registro: '2019-07-22', licencia: true, contacto: 'Sandra Vásquez', email: 's.vasquez@lacteoscentro.gt', productos: 32, monto_mensual: 78500 },
  { id: 'PRV-003', nombre: 'CarniCentral Corp.', pais: 'México', rating: 4.2, categoria: 'Carnes', fecha_registro: '2021-01-10', licencia: true, contacto: 'Miguel Ángel Ríos', email: 'm.rios@carnicentral.mx', productos: 25, monto_mensual: 112000 },
  { id: 'PRV-004', nombre: 'Panadería Nacional', pais: 'Guatemala', rating: 4.7, categoria: 'Panadería', fecha_registro: '2018-11-05', licencia: true, contacto: 'Elena Castro', email: 'e.castro@panacional.gt', productos: 40, monto_mensual: 45000 },
  { id: 'PRV-005', nombre: 'ImportVinos Ltda.', pais: 'Chile', rating: 3.9, categoria: 'Bebidas', fecha_registro: '2022-05-18', licencia: false, contacto: 'Felipe Morales', email: 'f.morales@importvinos.cl', productos: 18, monto_mensual: 67000 },
  { id: 'PRV-006', nombre: 'CleanHome Products', pais: 'El Salvador', rating: 4.3, categoria: 'Limpieza', fecha_registro: '2020-09-30', licencia: true, contacto: 'Claudia Ruiz', email: 'c.ruiz@cleanhome.sv', productos: 55, monto_mensual: 38000 },
  { id: 'PRV-007', nombre: 'CongelaTech', pais: 'Guatemala', rating: 4.6, categoria: 'Congelados', fecha_registro: '2021-08-14', licencia: true, contacto: 'Andrés Lima', email: 'a.lima@congelatech.gt', productos: 29, monto_mensual: 88000 },
];

// ─── ÓRDENES ──────────────────────────────────────────────────────────────────
export const ordenes = [
  { id: 'ORD-2026-0451', fecha: '2026-04-20', supermercado_id: 'SM-001', proveedor_id: 'PRV-001', total: 14500.00, urgencia: 'alta', estado: 'en_transito', items: ['Tomates (200kg)', 'Lechuga (50kg)', 'Manzanas (100kg)'], transportista_id: 'TRN-003' },
  { id: 'ORD-2026-0450', fecha: '2026-04-19', supermercado_id: 'SM-003', proveedor_id: 'PRV-002', total: 8750.50, urgencia: 'media', estado: 'entregado', items: ['Leche (500L)', 'Queso (80kg)'], transportista_id: 'TRN-001' },
  { id: 'ORD-2026-0449', fecha: '2026-04-19', supermercado_id: 'SM-002', proveedor_id: 'PRV-003', total: 22000.00, urgencia: 'alta', estado: 'procesando', items: ['Carne molida (300kg)', 'Pollo (250kg)'], transportista_id: 'TRN-005' },
  { id: 'ORD-2026-0448', fecha: '2026-04-18', supermercado_id: 'SM-005', proveedor_id: 'PRV-004', total: 5200.75, urgencia: 'baja', estado: 'entregado', items: ['Pan integral (200 unid)', 'Croissants (150 unid)'], transportista_id: 'TRN-002' },
  { id: 'ORD-2026-0447', fecha: '2026-04-18', supermercado_id: 'SM-001', proveedor_id: 'PRV-006', total: 3800.00, urgencia: 'baja', estado: 'pendiente', items: ['Detergente (100 cajas)', 'Escobas (50 unid)'], transportista_id: null },
  { id: 'ORD-2026-0446', fecha: '2026-04-17', supermercado_id: 'SM-006', proveedor_id: 'PRV-007', total: 18900.00, urgencia: 'media', estado: 'entregado', items: ['Pizza congelada (300 unid)', 'Helados (200 unid)'], transportista_id: 'TRN-004' },
  { id: 'ORD-2026-0445', fecha: '2026-04-17', supermercado_id: 'SM-002', proveedor_id: 'PRV-005', total: 11400.00, urgencia: 'media', estado: 'cancelado', items: ['Vino tinto (120 bote)', 'Cerveza (200 packs)'], transportista_id: null },
  { id: 'ORD-2026-0444', fecha: '2026-04-16', supermercado_id: 'SM-003', proveedor_id: 'PRV-001', total: 9600.25, urgencia: 'alta', estado: 'entregado', items: ['Fresas (80kg)', 'Bananas (120kg)'], transportista_id: 'TRN-001' },
];

// ─── TRANSPORTISTAS ───────────────────────────────────────────────────────────
export const transportistas = [
  { id: 'TRN-001', nombre: 'Juan Pablo Orozco', empresa_id: 'EMP-001', transporte: 'Camión refrigerado', rating: 4.9, activo: true, flota: 'F-101', rutas_activas: 3, entregas_mes: 28, zona: 'Ciudad de Guatemala' },
  { id: 'TRN-002', nombre: 'Rosa María Fuentes', empresa_id: 'EMP-001', transporte: 'Camioneta', rating: 4.6, activo: true, flota: 'F-102', rutas_activas: 2, entregas_mes: 22, zona: 'Antigua Guatemala' },
  { id: 'TRN-003', nombre: 'Héctor Estrada', empresa_id: 'EMP-002', transporte: 'Camión seco', rating: 4.4, activo: true, flota: 'F-201', rutas_activas: 4, entregas_mes: 35, zona: 'Zona Metropolitana' },
  { id: 'TRN-004', nombre: 'Carmen Alvarado', empresa_id: 'EMP-002', transporte: 'Camión refrigerado', rating: 4.7, activo: true, flota: 'F-202', rutas_activas: 2, entregas_mes: 18, zona: 'Occidente' },
  { id: 'TRN-005', nombre: 'Luis Fernando Díaz', empresa_id: 'EMP-003', transporte: 'Trailer', rating: 4.1, activo: false, flota: 'F-301', rutas_activas: 0, entregas_mes: 5, zona: 'Sin asignar' },
  { id: 'TRN-006', nombre: 'Andrea Solís', empresa_id: 'EMP-003', transporte: 'Furgón', rating: 4.8, activo: true, flota: 'F-302', rutas_activas: 3, entregas_mes: 30, zona: 'Sur del País' },
];

// ─── EMPRESAS DE TRANSPORTE ───────────────────────────────────────────────────
export const empresasTransporte = [
  { id: 'EMP-001', nombre: 'LogiCentro S.A.', rating: 4.7, activo: true, no_transportes: 12, transportistas_count: 2 },
  { id: 'EMP-002', nombre: 'TransGuate Corp.', rating: 4.5, activo: true, no_transportes: 8, transportistas_count: 2 },
  { id: 'EMP-003', nombre: 'RapidLogistics', rating: 4.2, activo: true, no_transportes: 15, transportistas_count: 2 },
];

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
export const dashboardStats = {
  total_ordenes: 445,
  ordenes_hoy: 12,
  sedes_activas: 5,
  proveedores_activos: 6,
  transportistas_activos: 5,
  ingresos_mes: 864450.50,
  ordenes_por_estado: {
    pendiente: 45,
    procesando: 88,
    en_transito: 124,
    entregado: 178,
    cancelado: 10,
  },
  top_proveedores: [
    { nombre: 'AgroFresh', monto: 95000 },
    { nombre: 'CarniCentral', monto: 112000 },
    { nombre: 'LácteosCentro', monto: 78500 },
    { nombre: 'CongelaTech', monto: 88000 },
    { nombre: 'ImportVinos', monto: 67000 },
  ],
};
