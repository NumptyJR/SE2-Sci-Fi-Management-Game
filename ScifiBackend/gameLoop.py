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

gameState = {
    "turn": 0,
    "totalStat": 100,
    "resources": {
        "ration": 0,
        "mineral": 0,
        "fuel": 0,
        "manufacture": 0,
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
        resource = planet.resource
        if resource in gameState["resources"]:
            gameState["resources"][resource] += planet.leader.resourceYield


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
        "id": random.randint(1,100000),
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

    # Command pattern: wrap the action so it can be undone and inspected
    cmd = ApplyChoiceCommand(currentPlanet, choice, currentEvent.name)
    command_history.execute(cmd)

    return {
        "planet": currentPlanet.name,
        "economy": currentPlanet.ecomStat,
        "military": currentPlanet.militaryStat,
        "unrest": currentPlanet.unrestStat
    }


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