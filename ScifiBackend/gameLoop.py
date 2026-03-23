import random
from events import eventList
from planets import planetList
from memento import GameMemento, caretaker
from command import ApplyChoiceCommand, CommandHistory
from observer import AlertObserver, StatChangeLogObserver

# Command pattern: shared history of all player decisions
command_history = CommandHistory()

# Observer pattern: shared observers attached to every planet
alert_observer = AlertObserver()
stat_log_observer = StatChangeLogObserver()

# Maps planet resource types to the canonical resource keys used throughout
# the app. Both backend gameState and frontend GameContext use these keys.
RESOURCE_MAP = {
    "ration": "rations",
    "mineral": "minerals",
    "fuel": "fuel",
    "manufacture": "manufactured",
    "medical": "medical",
}

gameState = {
    "turn": 0,
    "totalStat": 100,
    "resources": {
        "rations": 0,
        "minerals": 0,
        "fuel": 0,
        "manufactured": 0,
        "medical": 0,
    }
}

currentEvent = None
currentPlanet = None


def start_game():
    # Observer pattern: attach observers to every planet once at game start
    for planet in planetList:
        planet.attach(alert_observer)
        planet.attach(stat_log_observer)
    gameState["turn"] = 1
    return gameState


def collect_resources():
    for planet in planetList:
        key = RESOURCE_MAP.get(planet.resource)
        if key:
            gameState["resources"][key] += planet.leader.resourceYield


def format_choice(choice, cid):
    return {
        "id": cid,
        "text": choice.cName,
        "cost": choice.resourceCost,
        "effects": {
            "economy": choice.ecomEffect,
            "military": choice.militaryEffect,
            "unrest": choice.unrestEffect
        }
    }


def generate_event():
    global currentEvent, currentPlanet

    currentPlanet = random.choice(planetList)
    currentEvent = random.choice(eventList)

    return {
        "id": random.randint(1, 100000),
        "title": currentEvent.name,
        "category": "System",
        "location": currentPlanet.name,
        "description": currentEvent.description,
        "choices": [
            format_choice(currentEvent.c1, 1),
            format_choice(currentEvent.c2, 2),
            format_choice(currentEvent.c3, 3)
        ]
    }


def get_current_event():
    global currentEvent, currentPlanet

    if currentEvent is None:
        return None

    return {
        "id": random.randint(1, 100000),
        "title": currentEvent.name,
        "category": "System",
        "location": currentPlanet.name,
        "description": currentEvent.description,
        "choices": [
            format_choice(currentEvent.c1, 1),
            format_choice(currentEvent.c2, 2),
            format_choice(currentEvent.c3, 3)
        ]
    }


def apply_choice(choice_id):
    if choice_id == 1:
        choice = currentEvent.c1
    elif choice_id == 2:
        choice = currentEvent.c2
    else:
        choice = currentEvent.c3

    # Deduct resource cost from every resource pool.
    # resourceCost is stored as a negative integer (e.g. -5 means "costs 5").
    # We floor at 0 so a single expensive choice can't send resources negative.
    if choice.resourceCost != 0:
        for key in gameState["resources"]:
            gameState["resources"][key] = max(
                0, gameState["resources"][key] + choice.resourceCost
            )

    # Command pattern: wrap the action so it can be undone and inspected
    cmd = ApplyChoiceCommand(currentPlanet, choice, currentEvent.name)
    command_history.execute(cmd)

    return {
        "planet": currentPlanet.name,
        "economy": currentPlanet.ecomStat,
        "military": currentPlanet.militaryStat,
        "unrest": currentPlanet.unrestStat
    }


def get_all_planets_state():
    """Return lightweight stat snapshot for every planet."""
    return [
        {
            "id": p.name.lower(),
            "name": p.name,
            "economy": p.ecomStat,
            "military": p.militaryStat,
            "unrest": p.unrestStat,
        }
        for p in planetList
    ]


def undo_last_choice() -> dict:
    """Undo the most recent player choice and return the updated planet stats."""
    cmd = command_history.undo_last()
    undone = cmd.to_dict()
    planet = next(p for p in planetList if p.name == undone["planet"])
    return {
        "undone": undone,
        "planet": planet.name,
        "economy": planet.ecomStat,
        "military": planet.militaryStat,
        "unrest": planet.unrestStat,
    }


def get_command_history() -> list:
    return command_history.get_history()


def get_alerts() -> list:
    return alert_observer.get_alerts()


def clear_alerts():
    alert_observer.clear_alerts()


def advance_turn():
    # Single source of truth for turn increment — server.py syncs from here
    gameState["turn"] += 1
    collect_resources()


# Memento pattern: Originator methods

def save_game(save_name: str) -> dict:
    """
    Originator: capture the current game state into a GameMemento
    and hand it to the Caretaker for storage.
    """
    planets_state = [
        {
            "name": p.name,
            "ecomStat": p.ecomStat,
            "militaryStat": p.militaryStat,
            "unrestStat": p.unrestStat,
        }
        for p in planetList
    ]
    memento = GameMemento(save_name, gameState, gameState["turn"], planets_state)
    caretaker.save(memento)
    return {
        "save_id": memento.save_id,
        "save_name": memento.save_name,
        "timestamp": memento.timestamp,
    }


def load_game(save_id: str) -> dict:
    """
    Originator: ask the Caretaker for a memento and restore state from it.
    Returns the restored turn number so server.py can sync its own counter.
    """
    memento = caretaker.restore(save_id)
    restored = memento.get_state()

    # Restore global game state dict in-place
    gameState.clear()
    gameState.update(restored["game_state"])

    # Restore per-planet stats
    planet_map = {p.name: p for p in planetList}
    for ps in restored["planets_state"]:
        planet = planet_map.get(ps["name"])
        if planet:
            planet.ecomStat = ps["ecomStat"]
            planet.militaryStat = ps["militaryStat"]
            planet.unrestStat = ps["unrestStat"]

    # Command pattern: clear history — loaded state is the new baseline
    command_history.clear()

    # Observer pattern: reset alerts to reflect the restored state
    alert_observer.clear_alerts()
    stat_log_observer.clear()

    return {
        "turn": restored["current_turn"],
        "resources": gameState["resources"],
    }


def evaluate_outcome() -> dict:
    """
    Called at game end (turn 15). Averages all planet stats across the system
    and returns a rating, narrative summary, and per-stat averages.
    """
    count = len(planetList)
    total_ecom = sum(p.ecomStat for p in planetList) / count
    total_mil = sum(p.militaryStat for p in planetList) / count
    total_unrest = sum(p.unrestStat for p in planetList) / count

    #Hight economy and military are good
    #A lower unrest stat is better
    score = (total_ecom + total_mil + (100 - total_unrest)) / 3

    if score >= 75:
        rating = "Sovereign"
        summary = (
            "The system flourishes under your governance. Colonies are stable, "
            "supply chains intact, and unrest has been held in check. History "
            "will remember your tenure as a golden era for the outer worlds."
        )
    elif score >= 50:
        rating = "Governor"
        summary = (
            "A competent, if uneven, tenure. The system holds together and the "
            "colonies survive. Your control remains intact. There "
            "is still more work to do."
        )
    elif score >= 25:
        rating = "Caretaker"
        summary = (
            "Barely contained. Several colonies teetered on the brink of revolt."
            "Your decisions kept the lights on, but the system is weaker "
            "for your time in command."
        )
    else:
        rating = "Failed State"
        summary = (
            "The system has fallen. Unrest overwhelmed your authority, "
            "economies collapsed, and the colonies have gone dark. "
            "The people has voted to shutdown your servers."
        )

    return {
        "score": round(score, 1),
        "rating": rating,
        "summary": summary,
        "averages": {
            "economy": round(total_ecom, 1),
            "military": round(total_mil, 1),
            "unrest": round(total_unrest, 1),
        }
    }