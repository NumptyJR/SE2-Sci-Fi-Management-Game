import json
import os
import copy
from datetime import datetime

SAVES_FILE = os.path.join(os.path.dirname(__file__), "saves.json")


class GameMemento:
    """
    Memento pattern — stores an immutable snapshot of the full game state.
    """

    def __init__(self, save_name: str, game_state: dict, current_turn: int, planets_state: list):
        self._save_id = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        self._save_name = save_name
        self._timestamp = datetime.now().isoformat()
        self._game_state = copy.deepcopy(game_state)
        self._current_turn = current_turn
        self._planets_state = copy.deepcopy(planets_state)

    # Read-only properties

    @property
    def save_id(self) -> str:
        return self._save_id

    @property
    def save_name(self) -> str:
        return self._save_name

    @property
    def timestamp(self) -> str:
        return self._timestamp

    @property
    def turn(self) -> int:
        return self._current_turn

    # State access

    def get_state(self) -> dict:
        return {
            "game_state": copy.deepcopy(self._game_state),
            "current_turn": self._current_turn,
            "planets_state": copy.deepcopy(self._planets_state),
        }

    # Serialisation helpers

    def to_dict(self) -> dict:
        return {
            "save_id": self._save_id,
            "save_name": self._save_name,
            "timestamp": self._timestamp,
            "game_state": self._game_state,
            "current_turn": self._current_turn,
            "planets_state": self._planets_state,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "GameMemento":
        m = cls.__new__(cls)
        m._save_id = data["save_id"]
        m._save_name = data["save_name"]
        m._timestamp = data["timestamp"]
        m._game_state = data["game_state"]
        m._current_turn = data["current_turn"]
        m._planets_state = data["planets_state"]
        return m


class GameCaretaker:
    """
    Caretaker — manages the collection of GameMementos.
    Persists saves to a JSON file so they survive server restarts.
    """

    def __init__(self):
        self._mementos: dict[str, GameMemento] = {}
        self._load_from_disk()

    # Disk persistence

    def _load_from_disk(self):
        if os.path.exists(SAVES_FILE):
            try:
                with open(SAVES_FILE, "r") as f:
                    raw = json.load(f)
                self._mementos = {
                    save_id: GameMemento.from_dict(data)
                    for save_id, data in raw.items()
                }
            except (json.JSONDecodeError, KeyError):
                self._mementos = {}

    def _persist_to_disk(self):
        with open(SAVES_FILE, "w") as f:
            json.dump(
                {sid: m.to_dict() for sid, m in self._mementos.items()},
                f,
                indent=2,
            )

    # Public caretaker interface

    def save(self, memento: GameMemento):
        """Store a new memento."""
        self._mementos[memento.save_id] = memento
        self._persist_to_disk()

    def restore(self, save_id: str) -> GameMemento:
        """Retrieve a memento by ID. Raises KeyError if not found."""
        if save_id not in self._mementos:
            raise KeyError(f"Save '{save_id}' not found.")
        return self._mementos[save_id]

    def delete(self, save_id: str):
        """Remove a saved memento."""
        if save_id in self._mementos:
            del self._mementos[save_id]
            self._persist_to_disk()

    def list_saves(self) -> list:
        """Return save metadata sorted newest-first."""
        return sorted(
            [
                {
                    "save_id": m.save_id,
                    "save_name": m.save_name,
                    "timestamp": m.timestamp,
                    "turn": m.turn,
                }
                for m in self._mementos.values()
            ],
            key=lambda x: x["timestamp"],
            reverse=True,
        )


# Module-level singleton — shared by gameLoop and server
caretaker = GameCaretaker()
