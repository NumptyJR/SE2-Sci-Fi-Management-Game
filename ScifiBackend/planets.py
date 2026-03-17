from builders import Planet
from leaders import leaderList

planetList = []

#Planet Template (Name, Description, Resource, EcomStat, MilitaryStat, UnrestStat, Leader)
planet1 = Planet("Planet1", "description", "ration", 100, 100, 100, leaderList[0])
planetList.append(planet1)
#Append to main list after initialization

planet2 = Planet("Planet2", "description", "mineral", 100, 100, 100, leaderList[1])
planetList.append(planet2)

planet3 = Planet("Planet3", "description", "fuel", 100, 100, 100, leaderList[0])
planetList.append(planet3)

planet4 = Planet("Planet4", "description", "manufacture", 100, 100, 100, leaderList[1])
planetList.append(planet4)

planet5 = Planet("Planet5", "description", "medical", 100, 100, 100, leaderList[0])
planetList.append(planet5)