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
    #Initializer 
    def __init__(self, name, description, resource, ecomStat, militaryStat, unrestStat, leader):
        self.name = name
        self.description = description
        self.resource = resource
        self.ecomStat = ecomStat
        self.militaryStat = militaryStat
        self.unrestStat = unrestStat
        self.leader = leader

class Leader(object):
    #Initializer 
    def __init__(self, name, description, resourceYield):
        self.name = name
        self.description = description
        self.resourceYield = resourceYield

