# BD2 Proyecto 2 — Supply Chain Neo4j

Sistema de cadena de suministros con Neo4j, FastAPI y React.

---

## Requisitos

- Python 3.10+
- Node.js 18+
- Cuenta en [Neo4j AuraDB](https://console.neo4j.io) o Neo4j local

---

## Configuración de Neo4j

1. Crea una instancia en AuraDB o levanta Neo4j local
2. Copia las credenciales que te da AuraDB

---

## Backend

### 1. Entrar a la carpeta

```bash
cd backend
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar credenciales

Crea un archivo `.env` dentro de `backend/` con tus datos:

```env
NEO4J_URI=neo4j+ssc://xxxxxxxx.databases.neo4j.io
NEO4J_USERNAME=usuario de neo4j
NEO4J_PASSWORD=tu-contraseña
```

> Para Neo4j local usa `NEO4J_URI=bolt://localhost:7687`

### 4. Cargar datos iniciales (solo la primera vez)

```bash
python seed.py
```

Genera 5000+ nodos: supermercados, almacenes, productos, transportistas, usuarios y órdenes.
Toma en cuenta que esto puede tardar 25min+
Cuentas demo creadas por el seed:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Gerente | `gerente@demo.com` | `demo123` |
| Manager | `manager@demo.com` | `demo123` |

### 5. Iniciar el servidor

```bash
python -m uvicorn main:app --reload --port 8000
```

API disponible en `http://localhost:8000`  
Documentación interactiva en `http://localhost:8000/docs`

---

## Frontend

### 1. Entrar a la carpeta raíz del repo

```bash
cd ..
```

### 2. Instalar dependencias (solo la primera vez)

```bash
npm install
```

### 3. Iniciar

```bash
npm run dev
```

App disponible en `http://localhost:5173`

---

## Correr el proyecto completo

Se necesitan **dos terminales abiertas al mismo tiempo**:

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

---

## Estructura del proyecto

```
BD2-proyecto-2/
├── backend/
│   ├── main.py           # App FastAPI
│   ├── database.py       # Conexión Neo4j
│   ├── models.py         # Schemas Pydantic
│   ├── seed.py           # Generador de datos
│   ├── requirements.txt
│   ├── .env              # Credenciales (no subir a git)
│   └── routers/
│       ├── usuarios.py
│       ├── supermercados.py
│       ├── productos.py
│       ├── almacenes.py
│       ├── ordenes.py
│       ├── transportistas.py
│       ├── relaciones.py
│       └── csv_upload.py
└── src/
    ├── App.jsx
    ├── services/
    │   └── api.js        # Todas las llamadas al backend
    └── pages/
        ├── manager/
        └── gerente/
```

---

## Queries útiles en Neo4j Browser

Ver gerentes:
```cypher
MATCH (u:Usuario {rol: "Gerente"}) RETURN u.nombre, u.correo, u.password LIMIT 10
```

Ver managers con su sucursal:
```cypher
MATCH (u:Usuario {rol: "Manager"})-[:ASIGNADO_A]->(s:Supermercado)
RETURN u.nombre, u.correo, u.password, s.nombre AS sucursal LIMIT 10
```

Ver última orden creada:
```cypher
MATCH (o:Orden) RETURN o ORDER BY o.fecha DESC LIMIT 1
```

Ver orden por ID:
```cypher
MATCH (o:Orden {id: "aqui-el-id"}) RETURN o
```