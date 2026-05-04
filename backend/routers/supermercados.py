from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db, node_to_dict, serialize
from models import SupermercadoCreate, SupermercadoUpdate, BulkPropertyUpdate, BulkPropertyDelete
import uuid

router = APIRouter(prefix="/api/supermercados", tags=["supermercados"])


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_supermercado(data: SupermercadoCreate, db: Session = Depends(get_db)):
    sid = str(uuid.uuid4())
    result = db.run(
        """
        CREATE (s:Supermercado {
            id: $id,
            cadena: $cadena,
            nombre: $nombre,
            direccion: $direccion,
            activo: $activo
        }) RETURN s
        """,
        id=sid, cadena=data.cadena, nombre=data.nombre,
        direccion=data.direccion, activo=data.activo,
    )
    return dict(result.single()["s"])


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_supermercados(activo: bool = None, cadena: str = None, db: Session = Depends(get_db)):
    filters, params = [], {}
    if activo is not None:
        filters.append("s.activo = $activo")
        params["activo"] = activo
    if cadena:
        filters.append("s.cadena = $cadena")
        params["cadena"] = cadena
    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(f"MATCH (s:Supermercado) {where} RETURN s", **params)
    return [node_to_dict(r["s"]) for r in result]


@router.get("/agregados")
def agregados_supermercados(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (s:Supermercado)
        RETURN s.cadena AS cadena,
               count(s) AS total,
               sum(CASE WHEN s.activo THEN 1 ELSE 0 END) AS activos
        """
    )
    return [dict(r) for r in result]


@router.get("/{sid}")
def obtener_supermercado(sid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (s:Supermercado {id: $id}) RETURN s", id=sid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Supermercado no encontrado")
    return node_to_dict(record["s"])


@router.get("/{sid}/inventario")
def inventario_supermercado(sid: str, db: Session = Depends(get_db)):
    """Productos en inventario de una sucursal con stock info."""
    result = db.run(
        """
        MATCH (s:Supermercado {id: $id})-[r:TIENE_INVENTARIO]->(p:Producto)
        RETURN p, r.cantidad AS cantidad, r.stock_minimo AS stock_minimo,
               r.fecha_actualizacion AS fecha_actualizacion
        ORDER BY p.nombre
        """,
        id=sid,
    )
    return [
        {**node_to_dict(r["p"]), "cantidad": r["cantidad"],
         "stock_minimo": r["stock_minimo"], "fecha_actualizacion": r["fecha_actualizacion"]}
        for r in result
    ]


@router.get("/{sid}/usuarios")
def usuarios_supermercado(sid: str, db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (u:Usuario)-[r:ASIGNADO_A|SUPERVISA]->(s:Supermercado {id: $id})
        RETURN u, type(r) AS tipo_rel, r
        """,
        id=sid,
    )
    rows = []
    for r in result:
        u = node_to_dict(r["u"])
        u.pop("password", None)
        rows.append({"usuario": u, "relacion": r["tipo_rel"], "props_rel": node_to_dict(r["r"])})
    return rows


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{sid}")
def actualizar_supermercado(sid: str, data: SupermercadoUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    set_clause = ", ".join(f"s.{k} = ${k}" for k in props)
    result = db.run(
        f"MATCH (s:Supermercado {{id: $id}}) SET {set_clause} RETURN s",
        id=sid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Supermercado no encontrado")
    return node_to_dict(record["s"])


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"s.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (s:Supermercado) WHERE s.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"s.{k} = coalesce(s.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (s:Supermercado) WHERE s.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    remove_clause = ", ".join(f"s.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (s:Supermercado) WHERE s.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{sid}")
def eliminar_supermercado(sid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (s:Supermercado {id: $id}) DETACH DELETE s RETURN count(s) AS deleted",
        id=sid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Supermercado no encontrado")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_supermercados_bulk(ids: list[str], db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (s:Supermercado) WHERE s.id IN $ids DETACH DELETE s RETURN count(s) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
