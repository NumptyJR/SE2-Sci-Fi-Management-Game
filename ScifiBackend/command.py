from abc import ABC, abstractmethod


class Command(ABC):
    """
    Command pattern — abstract command interface.
    """

    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def undo(self):
        pass

    @abstractmethod
    def to_dict(self) -> dict:
        pass


class ApplyChoiceCommand(Command):
    """
    Concrete command that applies a player's event choice to a planet's stats.
    Stores the previous stat values so the action can be fully undone.
    """

    def __init__(self, planet, choice, event_name: str):
        self._planet = planet
        self._choice = choice
        self._event_name = event_name
        # Snapshot filled in on execute()
        self._prev_ecom: int | None = None
        self._prev_military: int | None = None
        self._prev_unrest: int | None = None

    def execute(self):
        # Capture state before applying effects
        self._prev_ecom = self._planet.ecomStat
        self._prev_military = self._planet.militaryStat
        self._prev_unrest = self._planet.unrestStat

        # Apply effects
        self._planet.ecomStat += self._choice.ecomEffect
        self._planet.militaryStat += self._choice.militaryEffect
        self._planet.unrestStat += self._choice.unrestEffect

    def undo(self):
        if self._prev_ecom is None:
            raise RuntimeError("Cannot undo a command that has not been executed.")
        self._planet.ecomStat = self._prev_ecom
        self._planet.militaryStat = self._prev_military
        self._planet.unrestStat = self._prev_unrest

    def to_dict(self) -> dict:
        return {
            "planet": self._planet.name,
            "event": self._event_name,
            "choice": self._choice.cName,
            "effects": {
                "economy":  self._choice.ecomEffect,
                "military": self._choice.militaryEffect,
                "unrest":   self._choice.unrestEffect,
            },
        }


class CommandHistory:
    """
    Manages a stack of executed commands, enabling undo and history inspection.
    """

    def __init__(self):
        self._history: list[Command] = []

    def execute(self, command: Command):
        """Run a command and push it onto the history stack."""
        command.execute()
        self._history.append(command)

    def undo_last(self) -> Command:
        """Undo the most recent command and remove it from history."""
        if not self._history:
            raise RuntimeError("No commands to undo.")
        command = self._history.pop()
        command.undo()
        return command

    def get_history(self) -> list[dict]:
        """Return all executed commands as serialisable dicts, oldest first."""
        return [cmd.to_dict() for cmd in self._history]

    def clear(self):
        self._history.clear()
