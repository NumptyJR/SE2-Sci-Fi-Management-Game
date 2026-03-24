from builders import Leader
from db import get_connection


def _load_from_db():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT ON (lt.planet_template_id)
                pt.name          AS planet_name,
                lt.id            AS db_id,
                lt.name,
                lt.attributes_summary AS description
            FROM leader_template lt
            JOIN planet_template pt ON lt.planet_template_id = pt.id
            ORDER BY lt.planet_template_id, lt.id
        """)
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    leader_map = {}
    leader_list = []
    for planet_name, db_id, name, description in rows:
        leader = Leader(name, description or "", 2)
        leader.db_id = db_id
        leader_map[planet_name] = leader
        leader_list.append(leader)

    return leader_list, leader_map


leaderList, leaderMap = _load_from_db()
