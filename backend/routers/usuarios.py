from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db
from models import UsuarioCreate, UsuarioUpdate, UsuarioLogin, BulkPropertyUpdate, BulkPropertyDelete
import uuid

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


# ─── AUTH ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(data: UsuarioLogin, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (u:Usuario {correo: $correo, password: $password}) RETURN u",
        correo=data.correo,
        password=data.password,
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    u = dict(record["u"])
    u.pop("password", None)
    return {"ok": True, "usuario": u}


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    uid = str(uuid.uuid4())
    result = db.run(
        """
        CREATE (u:Usuario {
            id: $id,
            nombre: $nombre,
            correo: $correo,
            password: $password,
            activo: $activo,
            rol: $rol
        }) RETURN u
        """,
        id=uid,
        nombre=data.nombre,
        correo=data.correo,
        password=data.password,
        activo=data.activo,
        rol=data.rol,
    )
    u = dict(result.single()["u"])
    u.pop("password", None)
    return u


# nodo con 2+ labels (Usuario + rol como label extra)
@router.post("/con-rol-label")
def crear_usuario_con_rol_label(data: UsuarioCreate, db: Session = Depends(get_db)):
    """Crea un Usuario con la label extra de su rol (e.g. :Usuario:Gerente)."""
    uid = str(uuid.uuid4())
    label = data.rol  # "Gerente" o "Manager"
    result = db.run(
        f"""
        CREATE (u:Usuario:{label} {{
            id: $id,
            nombre: $nombre,
            correo: $correo,
            password: $password,
            activo: $activo,
            rol: $rol
        }}) RETURN u
        """,
        id=uid,
        nombre=data.nombre,
        correo=data.correo,
        password=data.password,
        activo=data.activo,
        rol=data.rol,
    )
    u = dict(result.single()["u"])
    u.pop("password", None)
    return u


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_usuarios(rol: str = None, activo: bool = None, db: Session = Depends(get_db)):
    filters = []
    params = {}
    if rol:
        filters.append("u.rol = $rol")
        params["rol"] = rol
    if activo is not None:
        filters.append("u.activo = $activo")
        params["activo"] = activo

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(f"MATCH (u:Usuario) {where} RETURN u", **params)
    usuarios = []
    for r in result:
        u = dict(r["u"])
        u.pop("password", None)
        usuarios.append(u)
    return usuarios


@router.get("/agregados")
def agregados_usuarios(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (u:Usuario)
        RETURN u.rol AS rol, count(u) AS total, sum(CASE WHEN u.activo THEN 1 ELSE 0 END) AS activos
        """
    )
    return [dict(r) for r in result]


@router.get("/{uid}")
def obtener_usuario(uid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (u:Usuario {id: $id}) RETURN u", id=uid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    u = dict(record["u"])
    u.pop("password", None)
    return u


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{uid}")
def actualizar_usuario(uid: str, data: UsuarioUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    set_clause = ", ".join(f"u.{k} = ${k}" for k in props)
    result = db.run(
        f"MATCH (u:Usuario {{id: $id}}) SET {set_clause} RETURN u",
        id=uid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    u = dict(record["u"])
    u.pop("password", None)
    return u


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    """Actualiza 1+ propiedades en múltiples usuarios al mismo tiempo."""
    set_clause = ", ".join(f"u.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (u:Usuario) WHERE u.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    """Agrega propiedades nuevas a múltiples usuarios (no sobreescribe las existentes)."""
    set_clause = ", ".join(f"u.{k} = coalesce(u.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (u:Usuario) WHERE u.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    """Elimina propiedades de múltiples usuarios al mismo tiempo."""
    remove_clause = ", ".join(f"u.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (u:Usuario) WHERE u.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{uid}")
def eliminar_usuario(uid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (u:Usuario {id: $id}) DETACH DELETE u RETURN count(u) AS deleted",
        id=uid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_usuarios_bulk(ids: list[str], db: Session = Depends(get_db)):
    """Elimina múltiples usuarios al mismo tiempo."""
    result = db.run(
        "MATCH (u:Usuario) WHERE u.id IN $ids DETACH DELETE u RETURN count(u) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
