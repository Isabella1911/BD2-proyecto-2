from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    usuarios,
    supermercados,
    productos,
    almacenes,
    ordenes,
    transportistas,
    relaciones,
    csv_upload,
)
from database import close_driver

app = FastAPI(
    title="Supply Chain API — Neo4j",
    description="Backend para la cadena de suministros del Proyecto 02 de Bases de Datos 2.",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allows the React frontend (vite dev server) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ──────────────────────────────────────────────────────────────────
app.include_router(usuarios.router)
app.include_router(supermercados.router)
app.include_router(productos.router)
app.include_router(almacenes.router)
app.include_router(ordenes.router)
app.include_router(transportistas.router)
app.include_router(relaciones.router)
app.include_router(csv_upload.router)


# ─── HEALTH ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Supply Chain API corriendo 🚀"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ─── SHUTDOWN ─────────────────────────────────────────────────────────────────
@app.on_event("shutdown")
def shutdown():
    close_driver()
