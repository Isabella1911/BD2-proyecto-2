"""
Script de seed: genera 5000+ nodos y los relaciona para crear un grafo conexo.
Ejecutar con: python seed.py

Requiere que .env esté configurado con las credenciales de Neo4j.
"""

import os
import uuid
import random
from datetime import date, timedelta
from faker import Faker
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

URI      = os.getenv("NEO4J_URI",      "bolt://localhost:7687")
USER     = os.getenv("NEO4J_USERNAME",     "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
fake   = Faker("es_MX")
random.seed(42)


# ─── helpers ──────────────────────────────────────────────────────────────────

def rand_date(start_year=2018, end_year=2025) -> str:
    start = date(start_year, 1, 1)
    end   = date(end_year, 12, 31)
    return str(start + timedelta(days=random.randint(0, (end - start).days)))


def uid() -> str:
    return str(uuid.uuid4())


# ─── counts ───────────────────────────────────────────────────────────────────

N_SUPERMERCADOS  = 40
N_ALMACENES      = 20
N_PRODUCTOS      = 500
N_TRANSPORTISTAS = 60
N_GERENTES       = 10
N_MANAGERS       = 80   # 2 per supermercado aprox
N_ORDENES        = 4000  # main bulk to hit 5000+ nodes

CATEGORIAS = ["Lácteos", "Carnes", "Verduras", "Frutas", "Panadería",
              "Bebidas", "Congelados", "Limpieza", "Higiene", "Electrónica"]
CADENAS    = ["HiperFresh", "MarketPlus", "FreshMart", "SuperCentro", "MegaVerde"]
TRANSPORTES = ["Camión refrigerado", "Camión seco", "Camioneta", "Trailer", "Furgón"]
ESTADOS_ORDEN = ["pendiente", "aprobada", "en_transporte", "entregada", "cancelada"]
URGENCIAS = ["baja", "normal", "alta", "urgente"]
TIPOS_ALMACEN = CATEGORIAS


def clear_db(tx):
    tx.run("MATCH (n) DETACH DELETE n")


def create_constraints(tx):
    for label, prop in [
        ("Usuario", "id"), ("Supermercado", "id"), ("Producto", "id"),
        ("Almacen", "id"), ("Transportista", "id"), ("Orden", "id"),
    ]:
        tx.run(f"CREATE CONSTRAINT IF NOT EXISTS FOR (n:{label}) REQUIRE n.{prop} IS UNIQUE")


# ─── node creators ────────────────────────────────────────────────────────────

def create_supermercados(tx, n):
    ids = []
    for _ in range(n):
        sid = uid()
        ids.append(sid)
        tx.run(
            """
            CREATE (:Supermercado {
                id: $id, cadena: $cadena, nombre: $nombre,
                direccion: $direccion, activo: $activo
            })
            """,
            id=sid,
            cadena=random.choice(CADENAS),
            nombre=fake.company() + " " + fake.city(),
            direccion=fake.address(),
            activo=random.random() > 0.1,
        )
    return ids


def create_almacenes(tx, n):
    ids = []
    for _ in range(n):
        aid = uid()
        ids.append(aid)
        tipos = random.sample(TIPOS_ALMACEN, k=random.randint(2, 5))
        tx.run(
            """
            CREATE (:Almacen {
                id: $id, nombre: $nombre, lugar: $lugar,
                capacidad: $capacidad, activo: $activo,
                tipos: $tipos, fecha_apertura: date($fecha_apertura)
            })
            """,
            id=aid,
            nombre="Almacén " + fake.city(),
            lugar=fake.city(),
            capacidad=random.randint(500, 10000),
            activo=random.random() > 0.05,
            tipos=tipos,
            fecha_apertura=rand_date(2010, 2022),
        )
    return ids


def create_productos(tx, n):
    ids = []
    for _ in range(n):
        pid = uid()
        ids.append(pid)
        tx.run(
            """
            CREATE (:Producto {
                id: $id, nombre: $nombre, precio: $precio, peso: $peso,
                categoria: $categoria, fecha: date($fecha), disponible: $disponible
            })
            """,
            id=pid,
            nombre=fake.word().capitalize() + " " + fake.word(),
            precio=round(random.uniform(1.5, 500.0), 2),
            peso=round(random.uniform(0.1, 25.0), 2),
            categoria=random.choice(CATEGORIAS),
            fecha=rand_date(2020, 2025),
            disponible=random.random() > 0.15,
        )
    return ids


def create_transportistas(tx, n):
    ids = []
    for _ in range(n):
        tid = uid()
        ids.append(tid)
        tx.run(
            """
            CREATE (:Transportista {
                id: $id, nombre: $nombre, transporte: $transporte,
                rating: $rating, activo: $activo, flota: $flota
            })
            """,
            id=tid,
            nombre=fake.name(),
            transporte=random.choice(TRANSPORTES),
            rating=round(random.uniform(3.0, 5.0), 1),
            activo=random.random() > 0.1,
            flota="F-" + str(random.randint(100, 999)),
        )
    return ids


def create_usuarios(tx, n_gerentes, n_managers):
    gerente_ids, manager_ids = [], []

    for _ in range(n_gerentes):
        gid = uid()
        gerente_ids.append(gid)
        tx.run(
            """
            CREATE (:Usuario:Gerente {
                id: $id, nombre: $nombre, correo: $correo,
                password: $password, activo: $activo, rol: 'Gerente'
            })
            """,
            id=gid,
            nombre=fake.name(),
            correo=fake.email(),
            password="gerente123",
            activo=True,
        )

    for _ in range(n_managers):
        mid = uid()
        manager_ids.append(mid)
        tx.run(
            """
            CREATE (:Usuario:Manager {
                id: $id, nombre: $nombre, correo: $correo,
                password: $password, activo: $activo, rol: 'Manager'
            })
            """,
            id=mid,
            nombre=fake.name(),
            correo=fake.email(),
            password="manager123",
            activo=random.random() > 0.05,
        )

    # fixed demo accounts
    tx.run(
        """
        MERGE (u:Usuario:Gerente {correo: 'gerente@demo.com'})
        SET u.id = coalesce(u.id, $id),
            u.nombre = 'Gerente Demo',
            u.password = 'demo123',
            u.activo = true,
            u.rol = 'Gerente'
        """,
        id=uid(),
    )
    tx.run(
        """
        MERGE (u:Usuario:Manager {correo: 'manager@demo.com'})
        SET u.id = coalesce(u.id, $id),
            u.nombre = 'Manager Demo',
            u.password = 'demo123',
            u.activo = true,
            u.rol = 'Manager'
        """,
        id=uid(),
    )

    return gerente_ids, manager_ids


def create_ordenes(tx, n, manager_ids, supermercado_ids, almacen_ids):
    ids = []
    for _ in range(n):
        oid = uid()
        ids.append(oid)
        tx.run(
            """
            CREATE (:Orden {
                id: $id, fecha: datetime($fecha), total: $total,
                urgencia: $urgencia, estado: $estado
            })
            """,
            id=oid,
            fecha=rand_date(2023, 2026) + "T00:00:00",
            total=round(random.uniform(500, 50000), 2),
            urgencia=random.choice(URGENCIAS),
            estado=random.choice(ESTADOS_ORDEN),
        )
    return ids


# ─── relationship creators ────────────────────────────────────────────────────

def link_managers_to_supermercados(tx, manager_ids, supermercado_ids):
    """Cada manager se asigna a un supermercado (ASIGNADO_A)."""
    for mid in manager_ids:
        sid = random.choice(supermercado_ids)
        tx.run(
            """
            MATCH (u:Usuario {id: $uid}), (s:Supermercado {id: $sid})
            CREATE (u)-[:ASIGNADO_A {
                rol_en_sucursal: 'Manager',
                fecha_inicio: date($fecha),
                activo: true
            }]->(s)
            """,
            uid=mid, sid=sid, fecha=rand_date(2019, 2024),
        )


def link_gerentes_to_supermercados(tx, gerente_ids, supermercado_ids):
    """Cada gerente supervisa varios supermercados (SUPERVISA)."""
    chunks = [supermercado_ids[i::len(gerente_ids)] for i in range(len(gerente_ids))]
    for gid, chunk in zip(gerente_ids, chunks):
        for sid in chunk:
            tx.run(
                """
                MATCH (u:Usuario {id: $uid}), (s:Supermercado {id: $sid})
                CREATE (u)-[:SUPERVISA {fecha_inicio: date($fecha), activo: true}]->(s)
                """,
                uid=gid, sid=sid, fecha=rand_date(2019, 2024),
            )


def link_productos_to_almacenes(tx, producto_ids, almacen_ids):
    """Cada producto se almacena en 1-3 almacenes (ALMACENADO_EN)."""
    for pid in producto_ids:
        for aid in random.sample(almacen_ids, k=random.randint(1, 3)):
            tx.run(
                """
                MATCH (p:Producto {id: $pid}), (a:Almacen {id: $aid})
                CREATE (p)-[:ALMACENADO_EN {
                    cantidad: $cantidad,
                    fecha_ingreso: date($fecha),
                    ubicacion: $ubicacion
                }]->(a)
                """,
                pid=pid, aid=aid,
                cantidad=random.randint(10, 2000),
                fecha=rand_date(2022, 2025),
                ubicacion="Pasillo-" + str(random.randint(1, 20)),
            )


def link_productos_to_supermercados(tx, producto_ids, supermercado_ids):
    """Cada supermercado tiene inventario de ~30 productos aleatorios (TIENE_INVENTARIO)."""
    for sid in supermercado_ids:
        sample = random.sample(producto_ids, k=min(30, len(producto_ids)))
        for pid in sample:
            tx.run(
                """
                MATCH (s:Supermercado {id: $sid}), (p:Producto {id: $pid})
                CREATE (s)-[:TIENE_INVENTARIO {
                    cantidad: $cantidad,
                    stock_minimo: $stock_minimo,
                    fecha_actualizacion: date($fecha)
                }]->(p)
                """,
                sid=sid, pid=pid,
                cantidad=random.randint(0, 500),
                stock_minimo=random.randint(5, 50),
                fecha=rand_date(2024, 2026),
            )


def link_transportistas_to_almacenes(tx, transportista_ids, almacen_ids):
    """Cada transportista distribuye desde 1-4 almacenes (DISTRIBUYE)."""
    for tid in transportista_ids:
        for aid in random.sample(almacen_ids, k=random.randint(1, 4)):
            tx.run(
                """
                MATCH (t:Transportista {id: $tid}), (a:Almacen {id: $aid})
                CREATE (t)-[:DISTRIBUYE {
                    zona: $zona, activo: $activo, calificacion: $calificacion
                }]->(a)
                """,
                tid=tid, aid=aid,
                zona=fake.city(),
                activo=random.random() > 0.1,
                calificacion=round(random.uniform(3.0, 5.0), 1),
            )


def link_ordenes(tx, orden_ids, manager_ids, supermercado_ids, almacen_ids, transportista_ids, producto_ids):
    """Conecta cada orden con usuario, supermercado, almacén, transportista y productos."""
    for oid in orden_ids:
        mid  = random.choice(manager_ids)
        sid  = random.choice(supermercado_ids)
        aid  = random.choice(almacen_ids)
        tid  = random.choice(transportista_ids)
        prods = random.sample(producto_ids, k=random.randint(1, 6))

        fecha = rand_date(2023, 2026)

        # REALIZA_PEDIDO
        tx.run(
            """
            MATCH (u:Usuario {id: $uid}), (o:Orden {id: $oid})
            CREATE (u)-[:REALIZA_PEDIDO {
                fecha_pedido: datetime($fecha),
                aprobado: $aprobado,
                ubicacion: $ubicacion
            }]->(o)
            """,
            uid=mid, oid=oid, fecha=fecha + "T00:00:00",
            aprobado=random.random() > 0.3,
            ubicacion=fake.city(),
        )
        # DESTINADA_A
        tx.run(
            """
            MATCH (o:Orden {id: $oid}), (s:Supermercado {id: $sid})
            CREATE (o)-[:DESTINADA_A {fecha_destino: datetime($fecha)}]->(s)
            """,
            oid=oid, sid=sid, fecha=fecha + "T00:00:00",
        )
        # DESPACHA
        tx.run(
            """
            MATCH (a:Almacen {id: $aid}), (o:Orden {id: $oid})
            CREATE (a)-[:DESPACHA {
                fecha_despacho: datetime($fecha),
                prioridad: $prioridad,
                encargado: $encargado
            }]->(o)
            """,
            aid=aid, oid=oid, fecha=fecha + "T00:00:00",
            prioridad=random.choice(URGENCIAS),
            encargado=fake.name(),
        )
        # TRANSPORTADA_POR
        tx.run(
            """
            MATCH (o:Orden {id: $oid}), (t:Transportista {id: $tid})
            CREATE (o)-[:TRANSPORTADA_POR {
                costo: $costo,
                ubicacion: $ubicacion,
                fecha_entrega: date($fecha)
            }]->(t)
            """,
            oid=oid, tid=tid,
            costo=round(random.uniform(50, 2000), 2),
            ubicacion=fake.city(),
            fecha=rand_date(2023, 2026),
        )
        # INCLUYE (productos)
        for pid in prods:
            precio = round(random.uniform(5, 200), 2)
            cant   = random.randint(1, 100)
            tx.run(
                """
                MATCH (o:Orden {id: $oid}), (p:Producto {id: $pid})
                CREATE (o)-[:INCLUYE {
                    cantidad: $cantidad,
                    precio_unitario: $precio,
                    subtotal: $subtotal,
                    descuento: $descuento,
                    devolucion: $devolucion
                }]->(p)
                """,
                oid=oid, pid=pid,
                cantidad=cant,
                precio=precio,
                subtotal=round(precio * cant, 2),
                descuento=round(random.uniform(0, 0.2), 2),
                devolucion=random.random() < 0.05,
            )


# ─── main ─────────────────────────────────────────────────────────────────────

def run():
    print("🔗 Conectando a Neo4j...")
    with driver.session() as db:

        print("🧹 Limpiando base de datos...")
        db.execute_write(clear_db)

        print("📐 Creando constraints...")
        db.execute_write(create_constraints)

        print(f"🏪 Creando {N_SUPERMERCADOS} supermercados...")
        supermercado_ids = db.execute_write(create_supermercados, N_SUPERMERCADOS)

        print(f"🏭 Creando {N_ALMACENES} almacenes...")
        almacen_ids = db.execute_write(create_almacenes, N_ALMACENES)

        print(f"📦 Creando {N_PRODUCTOS} productos...")
        producto_ids = db.execute_write(create_productos, N_PRODUCTOS)

        print(f"🚛 Creando {N_TRANSPORTISTAS} transportistas...")
        transportista_ids = db.execute_write(create_transportistas, N_TRANSPORTISTAS)

        print(f"👤 Creando {N_GERENTES} gerentes + {N_MANAGERS} managers...")
        gerente_ids, manager_ids = db.execute_write(create_usuarios, N_GERENTES, N_MANAGERS)

        print(f"📋 Creando {N_ORDENES} órdenes...")
        # Split into batches of 500 to avoid large transactions
        orden_ids = []
        batch_size = 500
        for i in range(0, N_ORDENES, batch_size):
            batch_n = min(batch_size, N_ORDENES - i)
            batch_ids = db.execute_write(create_ordenes, batch_n, manager_ids, supermercado_ids, almacen_ids)
            orden_ids.extend(batch_ids)
            print(f"   Órdenes: {len(orden_ids)}/{N_ORDENES}")

        print("🔗 Vinculando managers a supermercados...")
        db.execute_write(link_managers_to_supermercados, manager_ids, supermercado_ids)

        print("🔗 Vinculando gerentes a supermercados...")
        db.execute_write(link_gerentes_to_supermercados, gerente_ids, supermercado_ids)

        print("🔗 Vinculando productos a almacenes...")
        db.execute_write(link_productos_to_almacenes, producto_ids, almacen_ids)

        print("🔗 Vinculando inventario a supermercados...")
        db.execute_write(link_productos_to_supermercados, producto_ids, supermercado_ids)

        print("🔗 Vinculando transportistas a almacenes...")
        db.execute_write(link_transportistas_to_almacenes, transportista_ids, almacen_ids)

        print("🔗 Conectando órdenes (esto puede tardar unos minutos)...")
        batch_size = 200
        for i in range(0, len(orden_ids), batch_size):
            batch = orden_ids[i:i+batch_size]
            db.execute_write(
                link_ordenes, batch,
                manager_ids, supermercado_ids, almacen_ids,
                transportista_ids, producto_ids,
            )
            print(f"   Órdenes vinculadas: {min(i+batch_size, len(orden_ids))}/{len(orden_ids)}")

        # Count total nodes
        count = db.run("MATCH (n) RETURN count(n) AS total").single()["total"]
        print(f"\n✅ Seed completo. Total de nodos en Neo4j: {count}")
        print("   Cuentas demo:")
        print("   Gerente → gerente@demo.com / demo123")
        print("   Manager → manager@demo.com / demo123")

    driver.close()


if __name__ == "__main__":
    run()
