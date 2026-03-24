from builders import Event, Choice
from db import get_connection


def _load_from_db():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                et.id              AS event_id,
                et.title,
                et.description     AS event_desc,
                eo.id              AS option_id,
                eo.description     AS option_name,
                eo.cost_credits,
                eo.effect_economy,
                eo.effect_military,
                eo.effect_unrest
            FROM event_template et
            JOIN event_option eo ON eo.event_template_id = et.id
            ORDER BY et.id, eo.id
        """)
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    # Group options by event
    events_dict: dict = {}
    for (event_id, title, event_desc, option_id, option_name,
         cost_credits, effect_economy, effect_military, effect_unrest) in rows:
        if event_id not in events_dict:
            events_dict[event_id] = {
                "id": event_id,
                "title": title,
                "description": event_desc,
                "options": [],
            }
        choice = Choice(
            option_name,
            option_name,
            cost_credits or 0,
            effect_economy or 0,
            effect_military or 0,
            effect_unrest or 0,
        )
        choice.db_id = option_id
        events_dict[event_id]["options"].append(choice)

    _no_op = Choice("No action", "No action available.", 0, 0, 0, 0)
    _no_op.db_id = None

    event_list = []
    for data in events_dict.values():
        opts = data["options"]
        while len(opts) < 3:
            opts.append(_no_op)
        event = Event(data["title"], data["description"], opts[0], opts[1], opts[2])
        event.db_id = data["id"]
        event_list.append(event)

    return event_list


eventList = _load_from_db()
