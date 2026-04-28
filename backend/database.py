import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

URI      = os.getenv("NEO4J_URI",      "bolt://localhost:7687")
USER     = os.getenv("NEO4J_USER", os.getenv("NEO4J_USERNAME", "neo4j"))
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))


def get_db():
    """Dependency: yields a Neo4j session."""
    with driver.session() as session:
        yield session


def close_driver():
    driver.close()
