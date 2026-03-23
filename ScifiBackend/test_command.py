import unittest
from command import ApplyChoiceCommand, CommandHistory
from builders import Planet, Leader, Choice


# Helpers

def make_planet(name="TestPlanet", ecom=100, military=100, unrest=50):
    leader = Leader("Test Leader", "desc", 5)
    return Planet(name, "desc", "ration", ecom, military, unrest, leader)


def make_choice(ecom=0, military=0, unrest=0):
    return Choice("Test Choice", "desc", 0, ecom, military, unrest)


# ApplyChoiceCommand

class TestApplyChoiceCommand(unittest.TestCase):

    def setUp(self):
        self.planet = make_planet()

    # execute

    def test_execute_applies_ecom_effect(self):
        choice = make_choice(ecom=-10)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        self.assertEqual(self.planet.ecomStat, 90)

    def test_execute_applies_military_effect(self):
        choice = make_choice(military=15)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        self.assertEqual(self.planet.militaryStat, 100)

    def test_execute_applies_unrest_effect(self):
        choice = make_choice(unrest=-5)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        self.assertEqual(self.planet.unrestStat, 45)

    def test_execute_applies_all_effects_together(self):
        choice = make_choice(ecom=-10, military=5, unrest=20)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        self.assertEqual(self.planet.ecomStat, 90)
        self.assertEqual(self.planet.militaryStat, 100)
        self.assertEqual(self.planet.unrestStat, 70)

    # undo

    def test_undo_restores_ecom(self):
        choice = make_choice(ecom=-20)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        cmd.undo()
        self.assertEqual(self.planet.ecomStat, 100)

    def test_undo_restores_all_stats(self):
        choice = make_choice(ecom=-15, military=-10, unrest=25)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        cmd.undo()
        self.assertEqual(self.planet.ecomStat, 100)
        self.assertEqual(self.planet.militaryStat, 100)
        self.assertEqual(self.planet.unrestStat, 50)

    def test_undo_before_execute_raises(self):
        choice = make_choice(ecom=-10)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        with self.assertRaises(RuntimeError):
            cmd.undo()

    def test_execute_then_undo_leaves_planet_unchanged(self):
        original_ecom = self.planet.ecomStat
        original_mil = self.planet.militaryStat
        original_unrest = self.planet.unrestStat

        choice = make_choice(ecom=-30, military=10, unrest=15)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        cmd.execute()
        cmd.undo()

        self.assertEqual(self.planet.ecomStat, original_ecom)
        self.assertEqual(self.planet.militaryStat, original_mil)
        self.assertEqual(self.planet.unrestStat, original_unrest)

    # to_dict

    def test_to_dict_contains_expected_keys(self):
        choice = make_choice(ecom=-5, military=3, unrest=8)
        cmd = ApplyChoiceCommand(self.planet, choice, "Asteroid Event")
        d = cmd.to_dict()
        for key in ("planet", "event", "choice", "effects"):
            self.assertIn(key, d)

    def test_to_dict_planet_name(self):
        choice = make_choice()
        cmd = ApplyChoiceCommand(self.planet, choice, "Riot Event")
        self.assertEqual(cmd.to_dict()["planet"], "TestPlanet")

    def test_to_dict_event_name(self):
        choice = make_choice()
        cmd = ApplyChoiceCommand(self.planet, choice, "Riot Event")
        self.assertEqual(cmd.to_dict()["event"], "Riot Event")

    def test_to_dict_effects_shape(self):
        choice = make_choice(ecom=-5, military=3, unrest=8)
        cmd = ApplyChoiceCommand(self.planet, choice, "Test Event")
        effects = cmd.to_dict()["effects"]
        self.assertEqual(effects["economy"], -5)
        self.assertEqual(effects["military"], 3)
        self.assertEqual(effects["unrest"], 8)

    def test_to_dict_choice_name(self):
        choice = Choice("Send Aid", "desc", 0, -5, 0, -10)
        cmd = ApplyChoiceCommand(self.planet, choice, "Crisis Event")
        self.assertEqual(cmd.to_dict()["choice"], "Send Aid")


# CommandHistory

class TestCommandHistory(unittest.TestCase):

    def setUp(self):
        self.history = CommandHistory()
        self.planet = make_planet()

    def _make_cmd(self, ecom=0, military=0, unrest=0, event="Event"):
        return ApplyChoiceCommand(self.planet, make_choice(ecom, military, unrest), event)

    # execute

    def test_execute_runs_command(self):
        cmd = self._make_cmd(ecom=-10)
        self.history.execute(cmd)
        self.assertEqual(self.planet.ecomStat, 90)

    def test_execute_adds_to_history(self):
        self.history.execute(self._make_cmd())
        self.assertEqual(len(self.history.get_history()), 1)

    def test_multiple_executes_stack_in_order(self):
        self.history.execute(self._make_cmd(ecom=-10, event="Event A"))
        self.history.execute(self._make_cmd(ecom=-5,  event="Event B"))
        log = self.history.get_history()
        self.assertEqual(len(log), 2)
        self.assertEqual(log[0]["event"], "Event A")
        self.assertEqual(log[1]["event"], "Event B")

    def test_cumulative_effects_applied_in_order(self):
        self.history.execute(self._make_cmd(ecom=-10))
        self.history.execute(self._make_cmd(ecom=-20))
        self.assertEqual(self.planet.ecomStat, 70)

    # undo_last

    def test_undo_last_reverses_most_recent_command(self):
        self.history.execute(self._make_cmd(ecom=-10))
        self.history.execute(self._make_cmd(ecom=-20))
        self.history.undo_last()
        # Only the first -10 should remain applied
        self.assertEqual(self.planet.ecomStat, 90)

    def test_undo_last_removes_command_from_history(self):
        self.history.execute(self._make_cmd())
        self.history.undo_last()
        self.assertEqual(len(self.history.get_history()), 0)

    def test_undo_last_returns_the_undone_command(self):
        cmd = self._make_cmd(event="Undone Event")
        self.history.execute(cmd)
        returned = self.history.undo_last()
        self.assertEqual(returned.to_dict()["event"], "Undone Event")

    def test_undo_last_on_empty_history_raises(self):
        with self.assertRaises(RuntimeError):
            self.history.undo_last()

    def test_successive_undos_walk_back_stack(self):
        self.history.execute(self._make_cmd(ecom=-10))
        self.history.execute(self._make_cmd(military=-15))
        self.history.execute(self._make_cmd(unrest=20))
        self.history.undo_last()  # undo unrest
        self.history.undo_last()  # undo military
        self.assertEqual(self.planet.ecomStat, 90)
        self.assertEqual(self.planet.militaryStat, 100)
        self.assertEqual(self.planet.unrestStat, 50)

    def test_undo_all_then_history_empty(self):
        self.history.execute(self._make_cmd())
        self.history.execute(self._make_cmd())
        self.history.undo_last()
        self.history.undo_last()
        self.assertEqual(self.history.get_history(), [])

    # get_history

    def test_get_history_returns_list_of_dicts(self):
        self.history.execute(self._make_cmd(ecom=-5))
        log = self.history.get_history()
        self.assertIsInstance(log, list)
        self.assertIsInstance(log[0], dict)

    def test_get_history_empty_when_no_commands(self):
        self.assertEqual(self.history.get_history(), [])

    # clear

    def test_clear_empties_history(self):
        self.history.execute(self._make_cmd())
        self.history.execute(self._make_cmd())
        self.history.clear()
        self.assertEqual(self.history.get_history(), [])

    def test_clear_when_empty_is_safe(self):
        self.history.clear()  # should not raise

    def test_clear_does_not_undo_commands(self):
        self.history.execute(self._make_cmd(ecom=-25))
        self.history.clear()
        # Planet stat stays at the applied value — clear doesn't undo
        self.assertEqual(self.planet.ecomStat, 75)


if __name__ == "__main__":
    unittest.main()
