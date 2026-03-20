from flask import Flask, jsonify, request
import gameLoop
from memento import caretaker

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


# Command pattern endpoints

@app.route("/api/game/history", methods=["GET"])
def get_history():
    """Return the list of all player choices made this session, oldest first."""
    return jsonify(gameLoop.get_command_history())


@app.route("/api/game/undo", methods=["POST"])
def undo_choice():
    """Undo the most recent player choice."""
    try:
        result = gameLoop.undo_last_choice()
        return jsonify(result)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400


# Observer pattern endpoints

@app.route("/api/game/alerts", methods=["GET"])
def get_alerts():
    """Return all active threshold alerts (critical economy, military, or unrest)."""
    return jsonify(gameLoop.get_alerts())


@app.route("/api/game/alerts", methods=["DELETE"])
def clear_alerts():
    """Dismiss all current alerts."""
    gameLoop.clear_alerts()
    return jsonify({"cleared": True})


# Save / Load endpoints (Memento pattern)

@app.route("/api/game/saves", methods=["GET"])
def list_saves():
    """Return metadata for all saved games, newest first."""
    return jsonify(caretaker.list_saves())


@app.route("/api/game/save", methods=["POST"])
def save_game():
    """Create a new save from the current game state."""
    data = request.get_json() or {}
    save_name = data.get("save_name", f"Turn {currentTurn} Save")
    result = gameLoop.save_game(save_name)
    return jsonify(result), 201


@app.route("/api/game/load/<save_id>", methods=["POST"])
def load_game(save_id):
    """Restore game state from a saved memento."""
    global currentTurn, gameStarted
    try:
        result = gameLoop.load_game(save_id)
        currentTurn = result["turn"]
        gameStarted = True
        gameLoop.generate_event()
        return jsonify({
            "turn": currentTurn,
            "started": True,
            "resources": result["resources"],
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/game/save/<save_id>", methods=["DELETE"])
def delete_save(save_id):
    """Delete a saved game."""
    caretaker.delete(save_id)
    return jsonify({"deleted": save_id})


if __name__ == "__main__":
    app.run(port=8000)

      