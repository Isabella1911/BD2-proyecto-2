import os
from neo4j import GraphDatabase
from neo4j.time import Date, DateTime, Duration
from dotenv import load_dotenv

load_dotenv()

URI      = os.getenv("NEO4J_URI",      "bolt://localhost:7687")
USER     = os.getenv("NEO4J_USER", os.getenv("NEO4J_USERNAME", "neo4j"))
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))


def serialize(value):
    """Convierte tipos de Neo4j a tipos serializables por JSON."""
    if isinstance(value, DateTime):
        return value.isoformat()
    if isinstance(value, Date):
        return str(value)  # "2024-01-15"
    if isinstance(value, Duration):
        return str(value)
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize(v) for v in value]
    return value


def node_to_dict(node) -> dict:
    """Convierte un nodo Neo4j a dict con todas las propiedades serializadas."""
    return {k: serialize(v) for k, v in dict(node).items()}


def get_db():
    """Dependency: yields a Neo4j session."""
    with driver.session() as session:
        yield session


def close_driver():
    driver.close()