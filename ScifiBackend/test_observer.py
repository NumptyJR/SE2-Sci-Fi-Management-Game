import unittest
from observer import AlertObserver, StatChangeLogObserver, PlanetObserver
from builders import Planet, Leader


# Helpers

def make_planet(name="TestPlanet", ecom=100, military=100, unrest=0):
    leader = Leader("Test Leader", "desc", 5)
    return Planet(name, "desc", "ration", ecom, military, unrest, leader)


# PlanetObserver interface

class TestPlanetObserverInterface(unittest.TestCase):

    def test_cannot_instantiate_abstract_observer(self):
        with self.assertRaises(TypeError):
            PlanetObserver()


# AlertObserver

class TestAlertObserver(unittest.TestCase):

    def setUp(self):
        self.observer = AlertObserver()

    # unrest threshold

    def test_no_alert_when_unrest_below_threshold(self):
        self.observer.on_stat_change("P1", "unrestStat", 50, 69)
        self.assertEqual(self.observer.get_alerts(), [])

    def test_alert_fires_when_unrest_crosses_70(self):
        self.observer.on_stat_change("P1", "unrestStat", 69, 70)
        alerts = self.observer.get_alerts()
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["planet"], "P1")
        self.assertEqual(alerts[0]["stat"], "unrestStat")
        self.assertEqual(alerts[0]["level"], "critical")

    def test_no_alert_when_unrest_already_above_threshold(self):
        # Crossing from above (e.g. 80 -> 90) should not re-fire
        self.observer.on_stat_change("P1", "unrestStat", 75, 80)
        self.assertEqual(self.observer.get_alerts(), [])

    def test_no_alert_when_unrest_decreases_through_threshold(self):
        # Threshold only fires going up through 70, not down through it
        self.observer.on_stat_change("P1", "unrestStat", 71, 65)
        self.assertEqual(self.observer.get_alerts(), [])

    # economy threshold

    def test_alert_fires_when_economy_falls_to_30(self):
        self.observer.on_stat_change("P1", "ecomStat", 31, 30)
        alerts = self.observer.get_alerts()
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["stat"], "ecomStat")

    def test_no_alert_when_economy_already_below_threshold(self):
        self.observer.on_stat_change("P1", "ecomStat", 25, 20)
        self.assertEqual(self.observer.get_alerts(), [])

    def test_no_alert_when_economy_above_threshold(self):
        self.observer.on_stat_change("P1", "ecomStat", 50, 45)
        self.assertEqual(self.observer.get_alerts(), [])

    # military threshold

    def test_alert_fires_when_military_falls_to_30(self):
        self.observer.on_stat_change("P1", "militaryStat", 35, 28)
        alerts = self.observer.get_alerts()
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["stat"], "militaryStat")

    def test_no_alert_for_untracked_stat(self):
        self.observer.on_stat_change("P1", "someOtherStat", 100, 0)
        self.assertEqual(self.observer.get_alerts(), [])

    # multiple alerts

    def test_multiple_alerts_accumulate(self):
        self.observer.on_stat_change("P1", "unrestStat", 65, 75)
        self.observer.on_stat_change("P2", "ecomStat", 35, 25)
        self.assertEqual(len(self.observer.get_alerts()), 2)

    def test_alerts_from_different_planets_are_separate(self):
        self.observer.on_stat_change("P1", "unrestStat", 60, 72)
        self.observer.on_stat_change("P2", "unrestStat", 60, 71)
        planets = [a["planet"] for a in self.observer.get_alerts()]
        self.assertIn("P1", planets)
        self.assertIn("P2", planets)

    # clear / get_alerts

    def test_get_alerts_returns_copy(self):
        self.observer.on_stat_change("P1", "unrestStat", 60, 80)
        copy1 = self.observer.get_alerts()
        copy1.clear()
        self.assertEqual(len(self.observer.get_alerts()), 1)

    def test_clear_alerts_empties_list(self):
        self.observer.on_stat_change("P1", "unrestStat", 60, 80)
        self.observer.clear_alerts()
        self.assertEqual(self.observer.get_alerts(), [])

    def test_clear_alerts_when_empty_is_safe(self):
        self.observer.clear_alerts()  # should not raise
        self.assertEqual(self.observer.get_alerts(), [])


# StatChangeLogObserver

class TestStatChangeLogObserver(unittest.TestCase):

    def setUp(self):
        self.observer = StatChangeLogObserver()

    def test_records_stat_change(self):
        self.observer.on_stat_change("P1", "ecomStat", 100, 80)
        log = self.observer.get_log()
        self.assertEqual(len(log), 1)
        entry = log[0]
        self.assertEqual(entry["planet"], "P1")
        self.assertEqual(entry["stat"], "ecomStat")
        self.assertEqual(entry["from"], 100)
        self.assertEqual(entry["to"], 80)
        self.assertEqual(entry["delta"], -20)

    def test_positive_delta_recorded_correctly(self):
        self.observer.on_stat_change("P1", "militaryStat", 50, 65)
        self.assertEqual(self.observer.get_log()[0]["delta"], 15)

    def test_records_all_changes_in_order(self):
        self.observer.on_stat_change("P1", "ecomStat", 100, 90)
        self.observer.on_stat_change("P2", "unrestStat", 30, 50)
        self.observer.on_stat_change("P1", "militaryStat", 80, 60)
        log = self.observer.get_log()
        self.assertEqual(len(log), 3)
        self.assertEqual(log[0]["planet"], "P1")
        self.assertEqual(log[1]["planet"], "P2")
        self.assertEqual(log[2]["stat"], "militaryStat")

    def test_get_log_returns_copy(self):
        self.observer.on_stat_change("P1", "ecomStat", 100, 80)
        copy1 = self.observer.get_log()
        copy1.clear()
        self.assertEqual(len(self.observer.get_log()), 1)

    def test_clear_empties_log(self):
        self.observer.on_stat_change("P1", "ecomStat", 100, 80)
        self.observer.clear()
        self.assertEqual(self.observer.get_log(), [])

    def test_clear_when_empty_is_safe(self):
        self.observer.clear()  # should not raise


# Planet observable behaviour

class TestPlanetObservable(unittest.TestCase):

    def setUp(self):
        self.planet = make_planet()
        self.log = StatChangeLogObserver()

    def test_attach_registers_observer(self):
        self.planet.attach(self.log)
        self.planet.ecomStat = 80
        self.assertEqual(len(self.log.get_log()), 1)

    def test_detach_stops_notifications(self):
        self.planet.attach(self.log)
        self.planet.detach(self.log)
        self.planet.ecomStat = 50
        self.assertEqual(self.log.get_log(), [])

    def test_attach_same_observer_twice_does_not_duplicate(self):
        self.planet.attach(self.log)
        self.planet.attach(self.log)
        self.planet.ecomStat = 70
        self.assertEqual(len(self.log.get_log()), 1)

    def test_multiple_observers_all_notified(self):
        log2 = StatChangeLogObserver()
        self.planet.attach(self.log)
        self.planet.attach(log2)
        self.planet.militaryStat = 55
        self.assertEqual(len(self.log.get_log()), 1)
        self.assertEqual(len(log2.get_log()), 1)

    def test_notification_carries_correct_old_and_new_values(self):
        self.planet.attach(self.log)
        self.planet.ecomStat = 75
        entry = self.log.get_log()[0]
        self.assertEqual(entry["from"], 100)
        self.assertEqual(entry["to"], 75)

    def test_all_three_stats_trigger_notifications(self):
        self.planet.attach(self.log)
        self.planet.ecomStat = 90
        self.planet.militaryStat = 85
        self.planet.unrestStat = 10
        self.assertEqual(len(self.log.get_log()), 3)

    def test_no_notification_without_observer(self):
        # Should not raise even though no observers are attached
        self.planet.ecomStat = 50

    def test_alert_observer_fires_via_planet_property(self):
        alert = AlertObserver()
        self.planet.attach(alert)
        self.planet.unrestStat = 75  # starts at 0, crosses 70
        self.assertEqual(len(alert.get_alerts()), 1)


if __name__ == "__main__":
    unittest.main()
