import random
from events import eventList
from planets import planetList

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

    currentPlanet.ecomStat += choice.ecomEffect
    currentPlanet.militaryStat += choice.militaryEffect
    currentPlanet.unrestStat += choice.unrestEffect

    return {
        "planet": currentPlanet.name,
        "economy": currentPlanet.ecomStat,
        "military": currentPlanet.militaryStat,
        "unrest": currentPlanet.unrestStat
    }


def advance_turn():
    gameState["turn"] += 1
    collect_resources()