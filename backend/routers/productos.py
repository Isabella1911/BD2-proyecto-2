from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db
from models import ProductoCreate, ProductoUpdate, BulkPropertyUpdate, BulkPropertyDelete
import uuid

router = APIRouter(prefix="/api/productos", tags=["productos"])


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())
    result = db.run(
        """
        CREATE (p:Producto {
            id: $id,
            nombre: $nombre,
            precio: $precio,
            peso: $peso,
            categoria: $categoria,
            fecha: date($fecha),
            disponible: $disponible
        }) RETURN p
        """,
        id=pid, nombre=data.nombre, precio=data.precio, peso=data.peso,
        categoria=data.categoria, fecha=data.fecha, disponible=data.disponible,
    )
    return dict(result.single()["p"])


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_productos(
    categoria: str = None,
    disponible: bool = None,
    precio_min: float = None,
    precio_max: float = None,
    db: Session = Depends(get_db),
):
    filters, params = [], {}
    if categoria:
        filters.append("p.categoria = $categoria")
        params["categoria"] = categoria
    if disponible is not None:
        filters.append("p.disponible = $disponible")
        params["disponible"] = disponible
    if precio_min is not None:
        filters.append("p.precio >= $precio_min")
        params["precio_min"] = precio_min
    if precio_max is not None:
        filters.append("p.precio <= $precio_max")
        params["precio_max"] = precio_max

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(f"MATCH (p:Producto) {where} RETURN p ORDER BY p.nombre", **params)
    return [dict(r["p"]) for r in result]


@router.get("/agregados")
def agregados_productos(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (p:Producto)
        RETURN p.categoria AS categoria,
               count(p) AS total,
               avg(p.precio) AS precio_promedio,
               min(p.precio) AS precio_min,
               max(p.precio) AS precio_max
        ORDER BY total DESC
        """
    )
    return [dict(r) for r in result]


@router.get("/{pid}")
def obtener_producto(pid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (p:Producto {id: $id}) RETURN p", id=pid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return dict(record["p"])


@router.get("/{pid}/almacenes")
def almacenes_del_producto(pid: str, db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (p:Producto {id: $id})-[r:ALMACENADO_EN]->(a:Almacen)
        RETURN a, r.cantidad AS cantidad, r.fecha_ingreso AS fecha_ingreso, r.ubicacion AS ubicacion
        """,
        id=pid,
    )
    return [
        {**dict(r["a"]), "cantidad": r["cantidad"],
         "fecha_ingreso": r["fecha_ingreso"], "ubicacion": r["ubicacion"]}
        for r in result
    ]


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{pid}")
def actualizar_producto(pid: str, data: ProductoUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    # date fields need special handling
    set_parts = []
    for k in props:
        if k == "fecha":
            set_parts.append(f"p.{k} = date(${k})")
        else:
            set_parts.append(f"p.{k} = ${k}")
    set_clause = ", ".join(set_parts)
    result = db.run(
        f"MATCH (p:Producto {{id: $id}}) SET {set_clause} RETURN p",
        id=pid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return dict(record["p"])


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"p.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (p:Producto) WHERE p.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"p.{k} = coalesce(p.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (p:Producto) WHERE p.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    remove_clause = ", ".join(f"p.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (p:Producto) WHERE p.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{pid}")
def eliminar_producto(pid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (p:Producto {id: $id}) DETACH DELETE p RETURN count(p) AS deleted",
        id=pid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_productos_bulk(ids: list[str], db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (p:Producto) WHERE p.id IN $ids DETACH DELETE p RETURN count(p) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
