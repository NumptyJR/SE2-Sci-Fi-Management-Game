from builders import Planet, Leader
from leaders import leaderMap
from db import get_connection

_RESOURCE_NAME_MAP = {
    "Rations": "ration",
    "Minerals": "mineral",
    "Fuel": "fuel",
    "Manufactured Goods": "manufacture",
    "Medical Supplies": "medical",
}


def _load_from_db():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT pt.id, pt.name, pt.description, rt.name AS resource_name
            FROM planet_template pt
            LEFT JOIN resource_type rt ON pt.primary_output_resource_id = rt.id
            ORDER BY pt.id
        """)
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    planets = []
    for db_id, name, description, resource_name in rows:
        resource = _RESOURCE_NAME_MAP.get(resource_name, "ration")
        leader = leaderMap.get(name, Leader("Unknown Governor", "No leader assigned.", 2))
        planet = Planet(name, description or "description", resource, 50, 50, 25, leader)
        planet.db_id = db_id
        planets.append(planet)

    return planets


planetList = _load_from_db()
