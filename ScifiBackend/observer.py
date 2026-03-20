from abc import ABC, abstractmethod


class PlanetObserver(ABC):
    """
    Observer pattern — abstract subscriber interface.
    Implement this to react to planet stat changes.
    """

    @abstractmethod
    def on_stat_change(self, planet_name: str, stat: str, old_value: int, new_value: int):
        pass


class AlertObserver(PlanetObserver):
    """
    Concrete observer that fires alerts when planet stats cross critical thresholds.

    Thresholds:
      - unrestStat  >= 70  → critical high unrest
      - ecomStat    <= 30  → critical low economy
      - militaryStat <= 30 → critical low military strength
    """

    THRESHOLDS = {
        "unrestStat":    ("high", 70),
        "ecomStat":      ("low",  30),
        "militaryStat":  ("low",  30),
    }

    def __init__(self):
        self._alerts: list[dict] = []

    def on_stat_change(self, planet_name: str, stat: str, old_value: int, new_value: int):
        if stat not in self.THRESHOLDS:
            return

        direction, threshold = self.THRESHOLDS[stat]

        if direction == "high" and old_value < threshold <= new_value:
            self._alerts.append({
                "planet": planet_name,
                "stat": stat,
                "level": "critical",
                "message": f"{planet_name}: unrest has reached a critical level ({new_value})",
            })
        elif direction == "low" and old_value > threshold >= new_value:
            label = "economy" if stat == "ecomStat" else "military strength"
            self._alerts.append({
                "planet": planet_name,
                "stat": stat,
                "level": "critical",
                "message": f"{planet_name}: {label} has fallen to a critical level ({new_value})",
            })

    def get_alerts(self) -> list[dict]:
        return list(self._alerts)

    def clear_alerts(self):
        self._alerts.clear()


class StatChangeLogObserver(PlanetObserver):
    """
    Concrete observer that records every stat change for history/audit display.
    """

    def __init__(self):
        self._log: list[dict] = []

    def on_stat_change(self, planet_name: str, stat: str, old_value: int, new_value: int):
        self._log.append({
            "planet": planet_name,
            "stat": stat,
            "from": old_value,
            "to": new_value,
            "delta": new_value - old_value,
        })

    def get_log(self) -> list[dict]:
        return list(self._log)

    def clear(self):
        self._log.clear()
