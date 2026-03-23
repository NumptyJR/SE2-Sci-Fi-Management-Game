class Event(object):
    #Initializer
    def __init__(self, name, description, c1, c2, c3):
        self.name = name
        self.description = description
        self.c1 = c1
        self.c2 = c2
        self.c3 = c3

class Choice(object):
    #Initializer
    def __init__(self, cName, cDescription, resourceCost, ecomEffect, militaryEffect, unrestEffect):
        self.cName = cName
        self.cDescription = cDescription
        self.resourceCost = resourceCost
        self.ecomEffect = ecomEffect
        self.militaryEffect = militaryEffect
        self.unrestEffect = unrestEffect

class Planet(object):
    # Initializer
    def __init__(self, name, description, resource, ecomStat, militaryStat, unrestStat, leader):
        self.name = name
        self.description = description
        self.resource = resource
        self._ecomStat = ecomStat
        self._militaryStat = militaryStat
        self._unrestStat = unrestStat
        self.leader = leader
        self._observers = []

    # Observer pattern: subscriber management

    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def _notify(self, stat: str, old_value: int, new_value: int):
        for observer in self._observers:
            observer.on_stat_change(self.name, stat, old_value, new_value)

    # Properties — all values are clamped to [0, 100] to prevent
    # runaway stats from producing nonsensical negative or over-cap numbers.

    @property
    def ecomStat(self):
        return self._ecomStat

    @ecomStat.setter
    def ecomStat(self, value):
        old = self._ecomStat
        self._ecomStat = max(0, min(100, value))
        self._notify("ecomStat", old, self._ecomStat)

    @property
    def militaryStat(self):
        return self._militaryStat

    @militaryStat.setter
    def militaryStat(self, value):
        old = self._militaryStat
        self._militaryStat = max(0, min(100, value))
        self._notify("militaryStat", old, self._militaryStat)

    @property
    def unrestStat(self):
        return self._unrestStat

    @unrestStat.setter
    def unrestStat(self, value):
        old = self._unrestStat
        self._unrestStat = max(0, min(100, value))
        self._notify("unrestStat", old, self._unrestStat)

class Leader(object):
    #Initializer 
    def __init__(self, name, description, resourceYield):
        self.name = name
        self.description = description
        self.resourceYield = resourceYield

