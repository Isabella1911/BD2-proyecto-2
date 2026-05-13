from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db, node_to_dict, serialize
from models import (
    AsignadoACreate, SupervisaCreate,
    TieneInventarioCreate, AlmacenadoEnCreate,
    BulkPropertyUpdate, BulkPropertyDelete,
)
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/relaciones", tags=["relaciones"])


# ─── ASIGNADO_A  (Usuario -> Supermercado) ───────────────────────────────────

@router.post("/asignado-a")
def crear_asignado_a(data: AsignadoACreate, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (u:Usuario {id: $uid}), (s:Supermercado {id: $sid})
        MERGE (u)-[r:ASIGNADO_A]->(s)
        SET r.rol_en_sucursal = $rol_en_sucursal,
            r.fecha_inicio = date($fecha_inicio),
            r.activo = $activo
        """,
        uid=data.usuario_id, sid=data.supermercado_id,
        rol_en_sucursal=data.rol_en_sucursal,
        fecha_inicio=data.fecha_inicio,
        activo=data.activo,
    )
    return {"ok": True}


@router.patch("/asignado-a")
def actualizar_asignado_a(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    """Actualiza propiedades de relaciones ASIGNADO_A cuyos supermercado ids están en 'ids'."""
    set_clause = ", ".join(f"r.{k} = ${k}" for k in data.properties)
    db.run(
        f"""
        MATCH (:Usuario)-[r:ASIGNADO_A]->(s:Supermercado)
        WHERE s.id IN $ids
        SET {set_clause}
        """,
        ids=data.ids, **data.properties,
    )
    return {"ok": True}


@router.delete("/asignado-a")
def eliminar_asignado_a(usuario_id: str, supermercado_id: str, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (u:Usuario {id: $uid})-[r:ASIGNADO_A]->(s:Supermercado {id: $sid})
        DELETE r
        """,
        uid=usuario_id, sid=supermercado_id,
    )
    return {"ok": True}


@router.delete("/asignado-a/bulk")
def eliminar_asignado_a_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    """Elimina relaciones ASIGNADO_A para múltiples supermercados."""
    db.run(
        "MATCH (:Usuario)-[r:ASIGNADO_A]->(s:Supermercado) WHERE s.id IN $ids DELETE r",
        ids=data.ids,
    )
    return {"ok": True}


# ─── SUPERVISA  (Usuario -> Supermercado) ────────────────────────────────────

@router.post("/supervisa")
def crear_supervisa(data: SupervisaCreate, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (u:Usuario {id: $uid}), (s:Supermercado {id: $sid})
        MERGE (u)-[r:SUPERVISA]->(s)
        SET r.fecha_inicio = date($fecha_inicio),
            r.activo = $activo
        """,
        uid=data.usuario_id, sid=data.supermercado_id,
        fecha_inicio=data.fecha_inicio, activo=data.activo,
    )
    return {"ok": True}


@router.patch("/supervisa")
def actualizar_supervisa(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"r.{k} = ${k}" for k in data.properties)
    db.run(
        f"""
        MATCH (:Usuario)-[r:SUPERVISA]->(s:Supermercado)
        WHERE s.id IN $ids
        SET {set_clause}
        """,
        ids=data.ids, **data.properties,
    )
    return {"ok": True}


@router.delete("/supervisa")
def eliminar_supervisa(usuario_id: str, supermercado_id: str, db: Session = Depends(get_db)):
    db.run(
        "MATCH (u:Usuario {id: $uid})-[r:SUPERVISA]->(s:Supermercado {id: $sid}) DELETE r",
        uid=usuario_id, sid=supermercado_id,
    )
    return {"ok": True}


@router.delete("/supervisa/bulk")
def eliminar_supervisa_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    db.run(
        "MATCH (:Usuario)-[r:SUPERVISA]->(s:Supermercado) WHERE s.id IN $ids DELETE r",
        ids=data.ids,
    )
    return {"ok": True}


# ─── TIENE_INVENTARIO  (Supermercado -> Producto) ────────────────────────────

@router.post("/tiene-inventario")
def crear_tiene_inventario(data: TieneInventarioCreate, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (s:Supermercado {id: $sid}), (p:Producto {id: $pid})
        MERGE (s)-[r:TIENE_INVENTARIO]->(p)
        SET r.cantidad = $cantidad,
            r.stock_minimo = $stock_minimo,
            r.fecha_actualizacion = date($fecha_actualizacion)
        """,
        sid=data.supermercado_id, pid=data.producto_id,
        cantidad=data.cantidad, stock_minimo=data.stock_minimo,
        fecha_actualizacion=data.fecha_actualizacion,
    )
    return {"ok": True}


@router.patch("/tiene-inventario")
def actualizar_tiene_inventario(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    """Actualiza propiedades de relaciones TIENE_INVENTARIO para productos en 'ids'."""
    set_clause = ", ".join(f"r.{k} = ${k}" for k in data.properties)
    db.run(
        f"""
        MATCH (:Supermercado)-[r:TIENE_INVENTARIO]->(p:Producto)
        WHERE p.id IN $ids
        SET {set_clause}
        """,
        ids=data.ids, **data.properties,
    )
    return {"ok": True}


@router.delete("/tiene-inventario")
def eliminar_tiene_inventario(supermercado_id: str, producto_id: str, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (s:Supermercado {id: $sid})-[r:TIENE_INVENTARIO]->(p:Producto {id: $pid})
        DELETE r
        """,
        sid=supermercado_id, pid=producto_id,
    )
    return {"ok": True}


@router.delete("/tiene-inventario/bulk")
def eliminar_tiene_inventario_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    db.run(
        "MATCH (:Supermercado)-[r:TIENE_INVENTARIO]->(p:Producto) WHERE p.id IN $ids DELETE r",
        ids=data.ids,
    )
    return {"ok": True}


# ─── ALMACENADO_EN  (Producto -> Almacen) ────────────────────────────────────

@router.post("/almacenado-en")
def crear_almacenado_en(data: AlmacenadoEnCreate, db: Session = Depends(get_db)):
    db.run(
        """
        MATCH (p:Producto {id: $pid}), (a:Almacen {id: $aid})
        MERGE (p)-[r:ALMACENADO_EN]->(a)
        SET r.cantidad = $cantidad,
            r.fecha_ingreso = date($fecha_ingreso),
            r.ubicacion = $ubicacion
        """,
        pid=data.producto_id, aid=data.almacen_id,
        cantidad=data.cantidad, fecha_ingreso=data.fecha_ingreso,
        ubicacion=data.ubicacion,
    )
    return {"ok": True}


@router.patch("/almacenado-en")
def actualizar_almacenado_en(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"r.{k} = ${k}" for k in data.properties)
    db.run(
        f"""
        MATCH (p:Producto)-[r:ALMACENADO_EN]->(a:Almacen)
        WHERE p.id IN $ids
        SET {set_clause}
        """,
        ids=data.ids, **data.properties,
    )
    return {"ok": True}


@router.delete("/almacenado-en")
def eliminar_almacenado_en(producto_id: str, almacen_id: str, db: Session = Depends(get_db)):
    db.run(
        "MATCH (p:Producto {id: $pid})-[r:ALMACENADO_EN]->(a:Almacen {id: $aid}) DELETE r",
        pid=producto_id, aid=almacen_id,
    )
    return {"ok": True}


@router.delete("/almacenado-en/bulk")
def eliminar_almacenado_en_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    db.run(
        "MATCH (p:Producto)-[r:ALMACENADO_EN]->(a:Almacen) WHERE p.id IN $ids DELETE r",
        ids=data.ids,
    )
    return {"ok": True}


# ─── AGREGAR PROPIEDADES GENÉRICO (todos los tipos de relación) ───────────────
#
# Un solo endpoint que cubre los 10 tipos de relación del sistema.
# Usa coalesce para NO pisar propiedades ya existentes en la relación.
#
# El campo `ids` referencia distintos nodos según el tipo:
#   ASIGNADO_A       → ids de Supermercado (destino)
#   SUPERVISA        → ids de Supermercado (destino)
#   TIENE_INVENTARIO → ids de Producto (destino)
#   ALMACENADO_EN    → ids de Producto (fuente)
#   REALIZA_PEDIDO   → ids de Orden (destino)
#   DESTINADA_A      → ids de Supermercado (destino)
#   INCLUYE          → ids de Producto (destino)
#   DESPACHA         → ids de Orden (destino)
#   DISTRIBUYE       → ids de Almacen (destino)
#   TRANSPORTADA_POR → ids de Transportista (destino)

_REL_MATCH_CLAUSE = {
    "ASIGNADO_A":       "MATCH (:Usuario)-[r:ASIGNADO_A]->(s:Supermercado) WHERE s.id IN $ids",
    "SUPERVISA":        "MATCH (:Usuario)-[r:SUPERVISA]->(s:Supermercado) WHERE s.id IN $ids",
    "TIENE_INVENTARIO": "MATCH (:Supermercado)-[r:TIENE_INVENTARIO]->(p:Producto) WHERE p.id IN $ids",
    "ALMACENADO_EN":    "MATCH (p:Producto)-[r:ALMACENADO_EN]->(:Almacen) WHERE p.id IN $ids",
    "REALIZA_PEDIDO":   "MATCH (:Usuario)-[r:REALIZA_PEDIDO]->(o:Orden) WHERE o.id IN $ids",
    "DESTINADA_A":      "MATCH (:Orden)-[r:DESTINADA_A]->(s:Supermercado) WHERE s.id IN $ids",
    "INCLUYE":          "MATCH (:Orden)-[r:INCLUYE]->(p:Producto) WHERE p.id IN $ids",
    "DESPACHA":         "MATCH (:Almacen)-[r:DESPACHA]->(o:Orden) WHERE o.id IN $ids",
    "DISTRIBUYE":       "MATCH (:Transportista)-[r:DISTRIBUYE]->(a:Almacen) WHERE a.id IN $ids",
    "TRANSPORTADA_POR": "MATCH (:Orden)-[r:TRANSPORTADA_POR]->(t:Transportista) WHERE t.id IN $ids",
}


class AgregarPropiedadesRelacion(BaseModel):
    tipo: str
    ids: List[str]
    properties: dict


@router.patch("/agregar-propiedades")
def agregar_propiedades_relacion(data: AgregarPropiedadesRelacion, db: Session = Depends(get_db)):
    """
    Agrega 1 o más propiedades nuevas a relaciones de cualquier tipo.
    Usa coalesce(r.prop, $prop) para NO pisar valores ya existentes.
    """
    match_clause = _REL_MATCH_CLAUSE.get(data.tipo)
    if not match_clause:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo '{data.tipo}' no soportado. Válidos: {', '.join(_REL_MATCH_CLAUSE.keys())}"
        )

    if not data.properties:
        raise HTTPException(status_code=400, detail="No se proporcionaron propiedades")

    set_clause = ", ".join(
        f"r.{k} = coalesce(r.{k}, ${k})" for k in data.properties
    )

    db.run(
        f"{match_clause} SET {set_clause}",
        ids=data.ids,
        **data.properties,
    )
    return {"ok": True, "tipo": data.tipo, "affected_ids": len(data.ids)}