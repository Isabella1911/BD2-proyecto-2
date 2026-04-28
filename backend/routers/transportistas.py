from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db
from models import TransportistaCreate, TransportistaUpdate, TransportadaPorCreate, DistribuyeCreate, BulkPropertyUpdate, BulkPropertyDelete
import uuid

router = APIRouter(prefix="/api/transportistas", tags=["transportistas"])


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_transportista(data: TransportistaCreate, db: Session = Depends(get_db)):
    tid = str(uuid.uuid4())
    result = db.run(
        """
        CREATE (t:Transportista {
            id: $id,
            nombre: $nombre,
            transporte: $transporte,
            rating: $rating,
            activo: $activo,
            flota: $flota
        }) RETURN t
        """,
        id=tid, nombre=data.nombre, transporte=data.transporte,
        rating=data.rating, activo=data.activo, flota=data.flota,
    )
    return dict(result.single()["t"])


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_transportistas(activo: bool = None, db: Session = Depends(get_db)):
    filters, params = [], {}
    if activo is not None:
        filters.append("t.activo = $activo")
        params["activo"] = activo
    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(f"MATCH (t:Transportista) {where} RETURN t ORDER BY t.rating DESC", **params)
    return [dict(r["t"]) for r in result]


@router.get("/agregados")
def agregados_transportistas(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (t:Transportista)
        RETURN t.transporte AS tipo,
               count(t) AS total,
               avg(t.rating) AS rating_promedio,
               sum(CASE WHEN t.activo THEN 1 ELSE 0 END) AS activos
        ORDER BY total DESC
        """
    )
    return [dict(r) for r in result]


@router.get("/{tid}")
def obtener_transportista(tid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (t:Transportista {id: $id}) RETURN t", id=tid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    return dict(record["t"])


@router.get("/{tid}/ordenes")
def ordenes_del_transportista(tid: str, db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (o:Orden)-[r:TRANSPORTADA_POR]->(t:Transportista {id: $id})
        RETURN o, r.costo AS costo, r.ubicacion AS ubicacion, r.fecha_entrega AS fecha_entrega
        ORDER BY o.fecha DESC
        """,
        id=tid,
    )
    return [
        {**dict(r["o"]), "costo": r["costo"],
         "ubicacion": r["ubicacion"], "fecha_entrega": r["fecha_entrega"]}
        for r in result
    ]


@router.get("/{tid}/almacenes")
def almacenes_del_transportista(tid: str, db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (t:Transportista {id: $id})-[r:DISTRIBUYE]->(a:Almacen)
        RETURN a, r.zona AS zona, r.activo AS activo, r.calificacion AS calificacion
        """,
        id=tid,
    )
    return [
        {**dict(r["a"]), "zona": r["zona"],
         "rel_activo": r["activo"], "calificacion": r["calificacion"]}
        for r in result
    ]


# ─── RELACIONES ───────────────────────────────────────────────────────────────

@router.post("/asignar-orden")
def asignar_transportista_a_orden(data: TransportadaPorCreate, db: Session = Depends(get_db)):
    """Crea relación TRANSPORTADA_POR entre Orden y Transportista."""
    check = db.run(
        "MATCH (o:Orden {id: $oid}), (t:Transportista {id: $tid}) RETURN o, t",
        oid=data.orden_id, tid=data.transportista_id
    ).single()
    if not check:
        raise HTTPException(status_code=404, detail="Orden o Transportista no encontrado")
    db.run(
        """
        MATCH (o:Orden {id: $oid}), (t:Transportista {id: $tid})
        MERGE (o)-[r:TRANSPORTADA_POR]->(t)
        SET r.costo = $costo,
            r.ubicacion = $ubicacion,
            r.fecha_entrega = date($fecha_entrega)
        """,
        oid=data.orden_id, tid=data.transportista_id,
        costo=data.costo, ubicacion=data.ubicacion, fecha_entrega=data.fecha_entrega,
    )
    return {"ok": True}


@router.post("/asignar-almacen")
def asignar_transportista_a_almacen(data: DistribuyeCreate, db: Session = Depends(get_db)):
    """Crea relación DISTRIBUYE entre Transportista y Almacén."""
    db.run(
        """
        MATCH (t:Transportista {id: $tid}), (a:Almacen {id: $aid})
        MERGE (t)-[r:DISTRIBUYE]->(a)
        SET r.zona = $zona, r.activo = $activo, r.calificacion = $calificacion
        """,
        tid=data.transportista_id, aid=data.almacen_id,
        zona=data.zona, activo=data.activo, calificacion=data.calificacion,
    )
    return {"ok": True}


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{tid}")
def actualizar_transportista(tid: str, data: TransportistaUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    set_clause = ", ".join(f"t.{k} = ${k}" for k in props)
    result = db.run(
        f"MATCH (t:Transportista {{id: $id}}) SET {set_clause} RETURN t",
        id=tid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    return dict(record["t"])


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"t.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (t:Transportista) WHERE t.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"t.{k} = coalesce(t.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (t:Transportista) WHERE t.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    remove_clause = ", ".join(f"t.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (t:Transportista) WHERE t.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{tid}")
def eliminar_transportista(tid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (t:Transportista {id: $id}) DETACH DELETE t RETURN count(t) AS deleted",
        id=tid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Transportista no encontrado")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_transportistas_bulk(ids: list[str], db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (t:Transportista) WHERE t.id IN $ids DETACH DELETE t RETURN count(t) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
