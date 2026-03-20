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

    # Properties

    @property
    def ecomStat(self):
        return self._ecomStat

    @ecomStat.setter
    def ecomStat(self, value):
        old = self._ecomStat
        self._ecomStat = value
        self._notify("ecomStat", old, value)

    @property
    def militaryStat(self):
        return self._militaryStat

    @militaryStat.setter
    def militaryStat(self, value):
        old = self._militaryStat
        self._militaryStat = value
        self._notify("militaryStat", old, value)

    @property
    def unrestStat(self):
        return self._unrestStat

    @unrestStat.setter
    def unrestStat(self, value):
        old = self._unrestStat
        self._unrestStat = value
        self._notify("unrestStat", old, value)

class Leader(object):
    #Initializer 
    def __init__(self, name, description, resourceYield):
        self.name = name
        self.description = description
        self.resourceYield = resourceYield

