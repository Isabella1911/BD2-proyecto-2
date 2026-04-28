"""
Router para carga de datos desde archivo CSV.
El archivo CSV debe tener una columna 'tipo' que indique el nodo a crear:
  usuario, supermercado, producto, almacen, transportista
Ejemplo CSV:
  tipo,nombre,correo,password,activo,rol
  usuario,Juan,juan@mail.com,1234,true,Manager
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from neo4j import Session
from database import get_db
import csv
import io
import uuid

router = APIRouter(prefix="/api/csv", tags=["csv"])

BOOL_MAP = {"true": True, "false": False, "1": True, "0": False}


def parse_bool(val: str) -> bool:
    return BOOL_MAP.get(str(val).lower(), False)


def parse_list(val: str) -> list:
    """Convierte 'a;b;c' → ['a','b','c']"""
    return [v.strip() for v in val.split(";") if v.strip()]


# ─── helpers por tipo ─────────────────────────────────────────────────────────

def _create_usuario(row: dict, db: Session):
    db.run(
        """
        MERGE (u:Usuario {correo: $correo})
        SET u.id = coalesce(u.id, $id),
            u.nombre = $nombre,
            u.password = $password,
            u.activo = $activo,
            u.rol = $rol
        """,
        id=str(uuid.uuid4()),
        nombre=row.get("nombre", ""),
        correo=row.get("correo", ""),
        password=row.get("password", ""),
        activo=parse_bool(row.get("activo", "true")),
        rol=row.get("rol", "Manager"),
    )


def _create_supermercado(row: dict, db: Session):
    db.run(
        """
        MERGE (s:Supermercado {nombre: $nombre, cadena: $cadena})
        SET s.id = coalesce(s.id, $id),
            s.direccion = $direccion,
            s.activo = $activo
        """,
        id=str(uuid.uuid4()),
        cadena=row.get("cadena", ""),
        nombre=row.get("nombre", ""),
        direccion=row.get("direccion", ""),
        activo=parse_bool(row.get("activo", "true")),
    )


def _create_producto(row: dict, db: Session):
    db.run(
        """
        MERGE (p:Producto {nombre: $nombre, categoria: $categoria})
        SET p.id = coalesce(p.id, $id),
            p.precio = $precio,
            p.peso = $peso,
            p.fecha = date($fecha),
            p.disponible = $disponible
        """,
        id=str(uuid.uuid4()),
        nombre=row.get("nombre", ""),
        precio=float(row.get("precio", 0)),
        peso=float(row.get("peso", 0)),
        categoria=row.get("categoria", ""),
        fecha=row.get("fecha", "2024-01-01"),
        disponible=parse_bool(row.get("disponible", "true")),
    )


def _create_almacen(row: dict, db: Session):
    db.run(
        """
        MERGE (a:Almacen {nombre: $nombre})
        SET a.id = coalesce(a.id, $id),
            a.lugar = $lugar,
            a.capacidad = $capacidad,
            a.activo = $activo,
            a.tipos = $tipos,
            a.fecha_apertura = date($fecha_apertura)
        """,
        id=str(uuid.uuid4()),
        nombre=row.get("nombre", ""),
        lugar=row.get("lugar", ""),
        capacidad=int(row.get("capacidad", 0)),
        activo=parse_bool(row.get("activo", "true")),
        tipos=parse_list(row.get("tipos", "")),
        fecha_apertura=row.get("fecha_apertura", "2020-01-01"),
    )


def _create_transportista(row: dict, db: Session):
    db.run(
        """
        MERGE (t:Transportista {nombre: $nombre, flota: $flota})
        SET t.id = coalesce(t.id, $id),
            t.transporte = $transporte,
            t.rating = $rating,
            t.activo = $activo
        """,
        id=str(uuid.uuid4()),
        nombre=row.get("nombre", ""),
        transporte=row.get("transporte", ""),
        rating=float(row.get("rating", 5.0)),
        activo=parse_bool(row.get("activo", "true")),
        flota=row.get("flota", ""),
    )


HANDLERS = {
    "usuario": _create_usuario,
    "supermercado": _create_supermercado,
    "producto": _create_producto,
    "almacen": _create_almacen,
    "transportista": _create_transportista,
}


# ─── ENDPOINT ─────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Carga masiva de nodos desde un archivo CSV.

    La primera columna debe llamarse 'tipo' con uno de los valores:
    usuario | supermercado | producto | almacen | transportista

    Las columnas restantes corresponden a las propiedades del nodo.
    Para la propiedad 'tipos' (lista en Almacen) usa punto y coma como separador: 'Lácteos;Carnes'
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .csv")

    content = await file.read()
    text = content.decode("utf-8-sig")  # utf-8-sig handles BOM from Excel exports
    reader = csv.DictReader(io.StringIO(text))

    created = 0
    errors = []

    for i, row in enumerate(reader, start=2):  # start=2 because row 1 = header
        tipo = row.get("tipo", "").strip().lower()
        handler = HANDLERS.get(tipo)
        if not handler:
            errors.append(f"Fila {i}: tipo desconocido '{tipo}'")
            continue
        try:
            handler(row, db)
            created += 1
        except Exception as e:
            errors.append(f"Fila {i}: {str(e)}")

    return {
        "ok": True,
        "created": created,
        "errors": errors,
        "total_rows": created + len(errors),
    }


@router.get("/template/{tipo}")
def descargar_template(tipo: str):
    """Retorna los headers esperados para cada tipo de nodo."""
    templates = {
        "usuario": "tipo,nombre,correo,password,activo,rol\nusuario,Juan López,juan@mail.com,pass123,true,Manager",
        "supermercado": "tipo,cadena,nombre,direccion,activo\nsupermercado,HiperFresh,HiperFresh Zona 10,Av. Reforma 12-01,true",
        "producto": "tipo,nombre,precio,peso,categoria,fecha,disponible\nproducto,Leche Entera,12.50,1.0,Lácteos,2024-01-15,true",
        "almacen": "tipo,nombre,lugar,capacidad,activo,tipos,fecha_apertura\nalmacen,Almacén Central,Guatemala,5000,true,Lácteos;Carnes;Verduras,2020-03-01",
        "transportista": "tipo,nombre,transporte,rating,activo,flota\ntransportista,Juan Pérez,Camión refrigerado,4.8,true,F-101",
    }
    if tipo not in templates:
        raise HTTPException(status_code=404, detail=f"Tipo '{tipo}' no reconocido")
    return {"tipo": tipo, "template_csv": templates[tipo]}
