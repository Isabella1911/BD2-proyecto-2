from fastapi import APIRouter, Depends, HTTPException
from neo4j import Session
from database import get_db
from models import OrdenCreate, OrdenUpdate, BulkPropertyUpdate, BulkPropertyDelete
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/ordenes", tags=["ordenes"])


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/")
def crear_orden(data: OrdenCreate, db: Session = Depends(get_db)):
    """
    Crea una Orden y todas sus relaciones en una sola transacción:
      (Usuario)-[:REALIZA_PEDIDO]->(Orden)
      (Orden)-[:DESTINADA_A]->(Supermercado)
      (Almacen)-[:DESPACHA]->(Orden)
      (Orden)-[:INCLUYE]->(Producto)  por cada item
    """
    oid = str(uuid.uuid4())
    fecha = datetime.utcnow().isoformat()

    # Verificar existencia de nodos relacionados
    for label, node_id in [
        ("Usuario", data.usuario_id),
        ("Supermercado", data.supermercado_id),
        ("Almacen", data.almacen_id),
    ]:
        r = db.run(f"MATCH (n:{label} {{id: $id}}) RETURN n", id=node_id).single()
        if not r:
            raise HTTPException(status_code=404, detail=f"{label} {node_id} no encontrado")

    # Crear nodo Orden + relaciones principales
    db.run(
        """
        MATCH (u:Usuario {id: $usuario_id}),
              (s:Supermercado {id: $supermercado_id}),
              (a:Almacen {id: $almacen_id})
        CREATE (o:Orden {
            id: $id,
            fecha: datetime($fecha),
            total: $total,
            urgencia: $urgencia,
            estado: $estado
        })
        CREATE (u)-[:REALIZA_PEDIDO {
            fecha_pedido: datetime($fecha),
            aprobado: false,
            ubicacion: $ubicacion
        }]->(o)
        CREATE (o)-[:DESTINADA_A {fecha_destino: datetime($fecha)}]->(s)
        CREATE (a)-[:DESPACHA {
            fecha_despacho: datetime($fecha),
            prioridad: $urgencia,
            encargado: 'por asignar'
        }]->(o)
        """,
        id=oid,
        fecha=fecha,
        total=data.total,
        urgencia=data.urgencia,
        estado=data.estado,
        usuario_id=data.usuario_id,
        supermercado_id=data.supermercado_id,
        almacen_id=data.almacen_id,
        ubicacion="pendiente",
    )

    # Crear relaciones INCLUYE para cada item
    for item in data.items:
        p = db.run("MATCH (p:Producto {id: $id}) RETURN p", id=item.producto_id).single()
        if not p:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado")
        subtotal = round(item.cantidad * item.precio_unitario * (1 - item.descuento), 2)
        db.run(
            """
            MATCH (o:Orden {id: $oid}), (p:Producto {id: $pid})
            CREATE (o)-[:INCLUYE {
                cantidad: $cantidad,
                precio_unitario: $precio_unitario,
                subtotal: $subtotal,
                descuento: $descuento,
                devolucion: $devolucion
            }]->(p)
            """,
            oid=oid,
            pid=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            subtotal=subtotal,
            descuento=item.descuento,
            devolucion=item.devolucion,
        )

    result = db.run("MATCH (o:Orden {id: $id}) RETURN o", id=oid)
    return dict(result.single()["o"])


# ─── READ ─────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_ordenes(
    estado: str = None,
    urgencia: str = None,
    supermercado_id: str = None,
    usuario_id: str = None,
    db: Session = Depends(get_db),
):
    filters, params = [], {}
    if estado:
        filters.append("o.estado = $estado")
        params["estado"] = estado
    if urgencia:
        filters.append("o.urgencia = $urgencia")
        params["urgencia"] = urgencia
    if supermercado_id:
        filters.append("(o)-[:DESTINADA_A]->(:Supermercado {id: $supermercado_id})")
        params["supermercado_id"] = supermercado_id
    if usuario_id:
        filters.append("(:Usuario {id: $usuario_id})-[:REALIZA_PEDIDO]->(o)")
        params["usuario_id"] = usuario_id

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    result = db.run(
        f"MATCH (o:Orden) {where} RETURN o ORDER BY o.fecha DESC",
        **params
    )
    return [dict(r["o"]) for r in result]


@router.get("/agregados")
def agregados_ordenes(db: Session = Depends(get_db)):
    result = db.run(
        """
        MATCH (o:Orden)
        RETURN o.estado AS estado,
               count(o) AS total,
               sum(o.total) AS monto_total,
               avg(o.total) AS monto_promedio
        ORDER BY total DESC
        """
    )
    return [dict(r) for r in result]


@router.get("/{oid}")
def obtener_orden(oid: str, db: Session = Depends(get_db)):
    result = db.run("MATCH (o:Orden {id: $id}) RETURN o", id=oid)
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return dict(record["o"])


@router.get("/{oid}/detalle")
def detalle_orden(oid: str, db: Session = Depends(get_db)):
    """Orden completa con productos, supermercado destino y transportista."""
    orden = db.run("MATCH (o:Orden {id: $id}) RETURN o", id=oid).single()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    items = db.run(
        """
        MATCH (o:Orden {id: $id})-[r:INCLUYE]->(p:Producto)
        RETURN p, r.cantidad AS cantidad, r.precio_unitario AS precio_unitario,
               r.subtotal AS subtotal, r.descuento AS descuento
        """,
        id=oid,
    )
    destino = db.run(
        "MATCH (o:Orden {id: $id})-[:DESTINADA_A]->(s:Supermercado) RETURN s",
        id=oid,
    ).single()
    transportista = db.run(
        "MATCH (o:Orden {id: $id})-[r:TRANSPORTADA_POR]->(t:Transportista) RETURN t, r",
        id=oid,
    ).single()

    return {
        "orden": dict(orden["o"]),
        "items": [
            {**dict(r["p"]), "cantidad": r["cantidad"],
             "precio_unitario": r["precio_unitario"], "subtotal": r["subtotal"]}
            for r in items
        ],
        "destino": dict(destino["s"]) if destino else None,
        "transportista": {
            **dict(transportista["t"]),
            "rel": dict(transportista["r"]),
        } if transportista else None,
    }


# ─── UPDATE ───────────────────────────────────────────────────────────────────

@router.patch("/{oid}")
def actualizar_orden(oid: str, data: OrdenUpdate, db: Session = Depends(get_db)):
    props = {k: v for k, v in data.model_dump().items() if v is not None}
    if not props:
        raise HTTPException(status_code=400, detail="No hay propiedades para actualizar")
    set_clause = ", ".join(f"o.{k} = ${k}" for k in props)
    result = db.run(
        f"MATCH (o:Orden {{id: $id}}) SET {set_clause} RETURN o",
        id=oid, **props
    )
    record = result.single()
    if not record:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return dict(record["o"])


@router.patch("/bulk/propiedades")
def actualizar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"o.{k} = ${k}" for k in data.properties)
    db.run(
        f"MATCH (o:Orden) WHERE o.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "updated": len(data.ids)}


@router.patch("/bulk/agregar-propiedades")
def agregar_propiedades_bulk(data: BulkPropertyUpdate, db: Session = Depends(get_db)):
    set_clause = ", ".join(f"o.{k} = coalesce(o.{k}, ${k})" for k in data.properties)
    db.run(
        f"MATCH (o:Orden) WHERE o.id IN $ids SET {set_clause}",
        ids=data.ids, **data.properties
    )
    return {"ok": True, "affected": len(data.ids)}


@router.delete("/bulk/propiedades")
def eliminar_propiedades_bulk(data: BulkPropertyDelete, db: Session = Depends(get_db)):
    remove_clause = ", ".join(f"o.{k}" for k in data.property_keys)
    db.run(
        f"MATCH (o:Orden) WHERE o.id IN $ids REMOVE {remove_clause}",
        ids=data.ids
    )
    return {"ok": True, "affected": len(data.ids)}


# ─── DELETE ───────────────────────────────────────────────────────────────────

@router.delete("/{oid}")
def eliminar_orden(oid: str, db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (o:Orden {id: $id}) DETACH DELETE o RETURN count(o) AS deleted",
        id=oid
    )
    if result.single()["deleted"] == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"ok": True}


@router.delete("/bulk/eliminar")
def eliminar_ordenes_bulk(ids: list[str], db: Session = Depends(get_db)):
    result = db.run(
        "MATCH (o:Orden) WHERE o.id IN $ids DETACH DELETE o RETURN count(o) AS deleted",
        ids=ids
    )
    return {"ok": True, "deleted": result.single()["deleted"]}
