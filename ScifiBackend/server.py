from flask import Flask, jsonify, request
import gameLoop

app = Flask(__name__)

game_state = {
    "turn": 0,
    "ration": 0,
    "mineral": 0,
    "fuel": 0,
    "manufacture": 0,
    "medical": 0,
}

currentEvent = None
currentPlanet = None
gameStarted = False
currentTurn = 0

@app.route("/api/game", methods=["GET"])
def get_game():
    return {
        "turn": currentTurn,
        "started": gameStarted
    }

@app.route("/api/game/start", methods=["POST"])
def start_game():
    global gameStarted, currentTurn

    gameStarted = True
    currentTurn = 1

    gameLoop.start_game()
    gameLoop.generate_event()

    return jsonify({
        "turn": currentTurn,
        "started": True
    })


@app.route("/api/game/event", methods=["GET"])
def get_event():
    event = gameLoop.get_current_event()

    if event is None:
        event = gameLoop.generate_event()

    return jsonify(event)

@app.route("/api/game/planets", methods=["GET"])
def get_planets():
    planets = []

    for planet in gameLoop.planetList:
        planets.append({
            "id": planet.name.lower(),
            "name": planet.name,
            "primaryOutput": planet.resource,
            "economy": planet.ecomStat,
            "military": planet.militaryStat,
            "unrest": planet.unrestStat,
            "leader": {
                "name": planet.leader.name,
                "resourceYield": planet.leader.resourceYield
            }

        })

    return jsonify(planets)

@app.route("/api/game/codex", methods=["GET"])
def get_codex():
    return jsonify([
        {
            "id": "overview",
            "title": "Overview",
            "content": "The Sovereign system is a fractured network of colonies.",
            "children": [
                {
                    "id": "history",
                    "title": "History",
                    "content": "After the collapse of central authority..."
                }
            ]
        },
        {
            "id": "corporations",
            "title": "Corporations",
            "content": "Megacorporations control key sectors of the economy.",
            "children": []
        }
    ])


@app.route("/api/game/choice", methods=["POST"])
def make_choice():
    data = request.get_json()
    choice_id = data.get("choice")

    result = gameLoop.apply_choice(choice_id)
    resources = gameLoop.gameState["resources"]

    return jsonify({
        "planet": result,
        "resources": resources
    })


@app.route("/api/game/advance", methods=["POST"])
def advance_turn():
    global currentTurn

    currentTurn += 1
    gameLoop.advance_turn()

    # generate next turn's event
    gameLoop.generate_event()

    return jsonify({
        "turn": currentTurn,
        "started": True,
        "resources": gameLoop.gameState["resources"]
    })


if __name__ == "__main__":
    app.run(port=8000)

      