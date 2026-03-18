import json
import os
import tempfile
import unittest
from unittest.mock import patch

from memento import GameMemento, GameCaretaker


# Helpers

def make_game_state(turn=3):
    return {
        "turn": turn,
        "totalStat": 80,
        "resources": {
            "ration": 5,
            "mineral": 10,
            "fuel": 7,
            "manufacture": 3,
            "medical": 2,
        },
    }

def make_planets_state():
    return [
        {"name": "Planet1", "ecomStat": 90, "militaryStat": 85, "unrestStat": 70},
        {"name": "Planet2", "ecomStat": 60, "militaryStat": 100, "unrestStat": 40},
    ]


# GameMemento tests

class TestGameMemento(unittest.TestCase):

    def setUp(self):
        self.game_state = make_game_state()
        self.planets = make_planets_state()
        self.memento = GameMemento("Test Save", self.game_state, 3, self.planets)

    def test_properties_are_set(self):
        self.assertEqual(self.memento.save_name, "Test Save")
        self.assertEqual(self.memento.turn, 3)
        self.assertIsInstance(self.memento.save_id, str)
        self.assertIsInstance(self.memento.timestamp, str)

    def test_get_state_returns_correct_data(self):
        state = self.memento.get_state()
        self.assertEqual(state["current_turn"], 3)
        self.assertEqual(state["game_state"]["turn"], 3)
        self.assertEqual(len(state["planets_state"]), 2)

    def test_snapshot_is_independent_of_original(self):
        # Mutating the original dict after creating the memento must not affect it
        self.game_state["turn"] = 99
        self.game_state["resources"]["ration"] = 999
        self.planets[0]["ecomStat"] = 1

        state = self.memento.get_state()
        self.assertEqual(state["game_state"]["turn"], 3)
        self.assertEqual(state["game_state"]["resources"]["ration"], 5)
        self.assertEqual(state["planets_state"][0]["ecomStat"], 90)

    def test_get_state_returns_deep_copy(self):
        # Mutating the returned state must not affect a second call
        state1 = self.memento.get_state()
        state1["game_state"]["turn"] = 42
        state1["planets_state"][0]["ecomStat"] = 1

        state2 = self.memento.get_state()
        self.assertEqual(state2["game_state"]["turn"], 3)
        self.assertEqual(state2["planets_state"][0]["ecomStat"], 90)

    def test_to_dict_round_trip(self):
        d = self.memento.to_dict()
        restored = GameMemento.from_dict(d)

        self.assertEqual(restored.save_id, self.memento.save_id)
        self.assertEqual(restored.save_name, self.memento.save_name)
        self.assertEqual(restored.timestamp, self.memento.timestamp)
        self.assertEqual(restored.turn, self.memento.turn)
        self.assertEqual(restored.get_state(), self.memento.get_state())

    def test_to_dict_contains_expected_keys(self):
        d = self.memento.to_dict()
        for key in ("save_id", "save_name", "timestamp", "game_state", "current_turn", "planets_state"):
            self.assertIn(key, d)


# GameCaretaker tests 

class TestGameCaretaker(unittest.TestCase):
   
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
        self.tmp.close()
        os.unlink(self.tmp.name)  # start with no file — caretaker creates it on first save

        patcher = patch("memento.SAVES_FILE", self.tmp.name)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(lambda: os.path.exists(self.tmp.name) and os.unlink(self.tmp.name))

        self.caretaker = GameCaretaker()

    def _make_memento(self, name="Save 1", turn=1):
        return GameMemento(name, make_game_state(turn), turn, make_planets_state())

    # save / restore 

    def test_save_and_restore(self):
        m = self._make_memento("My Save", turn=5)
        self.caretaker.save(m)

        retrieved = self.caretaker.restore(m.save_id)
        self.assertEqual(retrieved.save_name, "My Save")
        self.assertEqual(retrieved.turn, 5)

    def test_restore_unknown_id_raises(self):
        with self.assertRaises(KeyError):
            self.caretaker.restore("nonexistent-id")

    # delete 

    def test_delete_removes_save(self):
        m = self._make_memento()
        self.caretaker.save(m)
        self.caretaker.delete(m.save_id)

        with self.assertRaises(KeyError):
            self.caretaker.restore(m.save_id)

    def test_delete_nonexistent_is_silent(self):
        # Should not raise
        self.caretaker.delete("does-not-exist")

    # list_saves 

    def test_list_saves_returns_all(self):
        self.caretaker.save(self._make_memento("A"))
        self.caretaker.save(self._make_memento("B"))
        saves = self.caretaker.list_saves()
        names = [s["save_name"] for s in saves]
        self.assertIn("A", names)
        self.assertIn("B", names)

    def test_list_saves_sorted_newest_first(self):
        m1 = self._make_memento("First")
        m2 = self._make_memento("Second")
        self.caretaker.save(m1)
        self.caretaker.save(m2)

        saves = self.caretaker.list_saves()
        self.assertEqual(saves[0]["save_name"], "Second")

    def test_list_saves_empty_when_no_saves(self):
        self.assertEqual(self.caretaker.list_saves(), [])

    def test_list_saves_metadata_shape(self):
        self.caretaker.save(self._make_memento("Shape Test", turn=7))
        entry = self.caretaker.list_saves()[0]
        for key in ("save_id", "save_name", "timestamp", "turn"):
            self.assertIn(key, entry)
        self.assertEqual(entry["turn"], 7)

    # persistence 

    def test_saves_persist_to_disk(self):
        m = self._make_memento("Persistent")
        self.caretaker.save(m)
        self.assertTrue(os.path.exists(self.tmp.name))

        with open(self.tmp.name) as f:
            data = json.load(f)
        self.assertIn(m.save_id, data)

    def test_new_caretaker_loads_existing_saves(self):
        m = self._make_memento("Reload Me", turn=4)
        self.caretaker.save(m)

        # Simulate a server restart by creating a fresh caretaker pointed at the same file
        new_caretaker = GameCaretaker()
        retrieved = new_caretaker.restore(m.save_id)
        self.assertEqual(retrieved.save_name, "Reload Me")
        self.assertEqual(retrieved.turn, 4)

    def test_delete_persists_to_disk(self):
        m = self._make_memento("Gone")
        self.caretaker.save(m)
        self.caretaker.delete(m.save_id)

        with open(self.tmp.name) as f:
            data = json.load(f)
        self.assertNotIn(m.save_id, data)

    def test_corrupt_saves_file_starts_empty(self):
        with open(self.tmp.name, "w") as f:
            f.write("not valid json {{{{")

        fresh = GameCaretaker()
        self.assertEqual(fresh.list_saves(), [])

    # multiple saves

    def test_multiple_saves_independent(self):
        m1 = self._make_memento("Slot 1", turn=2)
        m2 = self._make_memento("Slot 2", turn=8)
        self.caretaker.save(m1)
        self.caretaker.save(m2)

        r1 = self.caretaker.restore(m1.save_id)
        r2 = self.caretaker.restore(m2.save_id)
        self.assertEqual(r1.turn, 2)
        self.assertEqual(r2.turn, 8)


if __name__ == "__main__":
    unittest.main()
