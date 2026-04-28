# Backend — Supply Chain Neo4j

Backend en **FastAPI** para el Proyecto 02 de Bases de Datos 2.  
Conecta con **Neo4j / AuraDB** y expone una API REST completa para la cadena de suministros.

---

## Estructura

```
backend/
├── main.py              # App FastAPI + CORS
├── database.py          # Conexión Neo4j
├── models.py            # Schemas Pydantic
├── seed.py              # Genera 5000+ nodos de prueba
├── requirements.txt
├── .env.example
└── routers/
    ├── usuarios.py      # Auth + CRUD Usuario
    ├── supermercados.py # CRUD Supermercado
    ├── productos.py     # CRUD Producto
    ├── almacenes.py     # CRUD Almacén
    ├── ordenes.py       # CRUD Orden (crea todas las relaciones)
    ├── transportistas.py# CRUD Transportista + asignaciones
    ├── relaciones.py    # CRUD relaciones restantes
    └── csv_upload.py    # Carga masiva desde CSV
```

---

## Setup

### 1. Credenciales Neo4j

```bash
cp .env.example .env
# Edita .env con tus credenciales de AuraDB o Neo4j local
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Seed — cargar datos iniciales (5000+ nodos)

```bash
python seed.py
```

### 4. Iniciar el servidor

```bash
uvicorn main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`.  
Documentación interactiva: `http://localhost:8000/docs`

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/usuarios/login` | Autenticación |
| `GET`  | `/api/usuarios/` | Listar usuarios (filtros: rol, activo) |
| `POST` | `/api/usuarios/` | Crear usuario (1 label) |
| `POST` | `/api/usuarios/con-rol-label` | Crear usuario con 2+ labels |
| `GET`  | `/api/supermercados/` | Listar supermercados |
| `GET`  | `/api/supermercados/{id}/inventario` | Inventario de una sucursal |
| `GET`  | `/api/almacenes/{id}/productos` | Productos en un almacén |
| `POST` | `/api/ordenes/` | Crear orden completa (crea todas las relaciones) |
| `GET`  | `/api/ordenes/{id}/detalle` | Orden con productos y transportista |
| `POST` | `/api/transportistas/asignar-orden` | Asignar transportista a orden |
| `POST` | `/api/relaciones/asignado-a` | Asignar manager a sucursal |
| `POST` | `/api/relaciones/supervisa` | Asignar gerente como supervisor |
| `POST` | `/api/csv/upload` | Carga masiva desde CSV |
| `GET`  | `/api/csv/template/{tipo}` | Template CSV por tipo de nodo |

### CRUD bulk (todos los nodos tienen estos endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `PATCH` | `/api/{nodo}/bulk/propiedades` | Actualizar props en múltiples nodos |
| `PATCH` | `/api/{nodo}/bulk/agregar-propiedades` | Agregar props a múltiples nodos |
| `DELETE` | `/api/{nodo}/bulk/propiedades` | Eliminar props de múltiples nodos |
| `DELETE` | `/api/{nodo}/bulk/eliminar` | Eliminar múltiples nodos |

### Agregaciones (todos los nodos)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/usuarios/agregados` | Conteo por rol |
| `GET` | `/api/ordenes/agregados` | Totales por estado |
| `GET` | `/api/productos/agregados` | Stats por categoría |
| `GET` | `/api/almacenes/agregados` | Capacidad por lugar |
| `GET` | `/api/transportistas/agregados` | Rating por tipo de transporte |
| `GET` | `/api/supermercados/agregados` | Conteo por cadena |

---

## Cuentas demo (después del seed)

| Rol | Email | Password |
|-----|-------|----------|
| Gerente | `gerente@demo.com` | `demo123` |
| Manager | `manager@demo.com` | `demo123` |

---

## Modelo de datos (resumen)

**Nodos:** `Usuario`, `Supermercado`, `Producto`, `Almacen`, `Orden`, `Transportista`

**Relaciones:**
- `(Usuario)-[:ASIGNADO_A]->(Supermercado)` — Manager asignado a sucursal
- `(Usuario)-[:SUPERVISA]->(Supermercado)` — Gerente supervisa sucursal
- `(Usuario)-[:REALIZA_PEDIDO]->(Orden)` — Manager crea una orden
- `(Orden)-[:DESTINADA_A]->(Supermercado)` — Destino de la orden
- `(Orden)-[:INCLUYE]->(Producto)` — Productos en la orden
- `(Almacen)-[:DESPACHA]->(Orden)` — Almacén despacha la orden
- `(Producto)-[:ALMACENADO_EN]->(Almacen)` — Stock en almacén
- `(Orden)-[:TRANSPORTADA_POR]->(Transportista)` — Quién entrega
- `(Transportista)-[:DISTRIBUYE]->(Almacen)` — Zona de distribución
- `(Supermercado)-[:TIENE_INVENTARIO]->(Producto)` — Inventario en sucursal
