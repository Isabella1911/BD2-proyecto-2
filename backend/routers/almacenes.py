from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db
from models import AlmacenCreate, AlmacenUpdate, BulkPropertyUpdate, BulkPropertyDelete
import uuid

router = APIRouter(prefix="/api/almacenes", tags=["almacenes"])


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_almacen(data: AlmacenCreate, db: Session = Depends(get_db)):
    aid = str(uuid.uuid4())
    result = db.run(
        """
        CREATE (a:Almacen {
            id: $id,
            nombre: $nombre,
            lugar: $lugar,
            capacidad: $capacidad,
            activo: $activo,
            tipos: $tipos,
            fecha_apertura: date($fecha_apertura)
        }) RETURN a
        """,
        id=aid, nombre=data.nombre, lugar=data.lugar, capacidad=data.capacidad,
        activo=data.activo, tipos=data.tipos, fecha_apertura=data.fecha_apertura,
    )
    return dict(result.single()["a"])


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_almacenes(activo: bool = None, lugar: str = None, db: Session = Depends(get_db)):
    filters, params = [], {}
    if activo is not None:
        filters.append("a.activo = $activo")
        params["activo"] = activo
    if lugar:
        filters.append("toLower(a.lugar) CONTAINS toLower($lugar)")
        params["lugar"] = lugar
    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(f"MATCH (a:Almacen) {where} RETURN a ORDER BY a.nombre", **params)
    return [dict(r["a"]) for r in result]


@router.get("/agregados")
def agregados_almacenes(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (a:Almacen)
        RETURN a.lugar AS lugar,
               count(a) AS total_almacenes,
               avg(a.capacidad) AS capacidad_promedio,
               sum(a.capacidad) AS capacidad_total
        ORDER BY total_almacenes DESC
        """
    )
    return [dict(r) for r in result]


@router.get("/{aid}")
def obtener_almacen(aid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (a:Almacen {id: $id}) RETURN a", id=aid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Almacén no encontrado")
    return dict(record["a"])


@router.get("/{aid}/productos")
def productos_en_almacen(aid: str, categoria: str = None, db: Session = Depends(get_db)):
    """Productos almacenados en este almacén con sus cantidades."""
    extra = "AND p.categoria = $categoria" if categoria else ""
    params = {"id": aid}
    if categoria:
        params["categoria"] = categoria
    result = db.run(
        f"""
        MATCH (p:Producto)-[r:ALMACENADO_EN]->(a:Almacen {{id: $id}})
        {extra}
        RETURN p, r.cantidad AS cantidad, r.ubicacion AS ubicacion, r.fecha_ingreso AS fecha_ingreso
        ORDER BY p.nombre
        """,
        **params,
    )
    return [
        {**dict(r["p"]), "cantidad": r["cantidad"],
         "ubicacion": r["ubicacion"], "fecha_ingreso": r["fecha_ingreso"]}
        for r in result
    ]


@router.get("/{aid}/ordenes")
def ordenes_del_almacen(aid: str, estado: str = None, db: Session = Depends(get_db)):
    extra = "AND o.estado = $estado" if estado else ""
    params = {"id": aid}
    if estado:
        params["estado"] = estado
    result = db.run(
        f"""
        MATCH (a:Almacen {{id: $id}})-[r:DESPACHA]->(o:Orden)
        {extra}
        RETURN o, r.fecha_despacho AS fecha_despacho, r.prioridad AS prioridad, r.encargado AS encargado
        ORDER BY o.fecha DESC
        """,
        **params,
    )
    return [
        {**dict(r["o"]), "fecha_despacho": r["fecha_despacho"],
         "prioridad": r["prioridad"], "encargado": r["encargado"]}
        for r in result
    ]


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{aid}")
def actualizar_almacen(aid: str, data: AlmacenUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    set_parts = []
    for k in props:
        if k == "fecha_apertura":
            set_parts.append(f"a.{k} = date(${k})")
        else:
            set_parts.append(f"a.{k} = ${k}")
    set_clause = ", ".join(set_parts)
    result = db.run(
        f"MATCH (a:Almacen {{id: $id}}) SET {set_clause} RETURN a",
        id=aid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Almacén no encontrado")
    return dict(record["a"])


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"a.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (a:Almacen) WHERE a.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"a.{k} = coalesce(a.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (a:Almacen) WHERE a.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    remove_clause = ", ".join(f"a.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (a:Almacen) WHERE a.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{aid}")
def eliminar_almacen(aid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (a:Almacen {id: $id}) DETACH DELETE a RETURN count(a) AS deleted",
        id=aid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Almacén no encontrado")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_almacenes_bulk(ids: list[str], db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (a:Almacen) WHERE a.id IN $ids DETACH DELETE a RETURN count(a) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
