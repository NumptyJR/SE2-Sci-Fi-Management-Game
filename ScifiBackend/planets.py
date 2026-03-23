from builders import Planet
from leaders import leaderList

planetList = []

#Planet Descriptions
folDescription = "Once a barren terrestrial planet on the inner system ring, terraforming efforts over the last four centuries have transformed its desert expenses into lush, nutrient dense soil. Green spheres populate the planet’s surface creating mini control climates for the production of food and collection of water through deep, underground ice veins. A small population of working residents maintain production and planet-to-planet supply chains to ensure rations are distributed throughout the planets."

#Planet Template (Name, Description, Resource, EcomStat, MilitaryStat, UnrestStat, Leader)
planet1 = Planet("Fol", folDescription, "ration", 100, 100, 100, leaderList[0])
planetList.append(planet1)
#Append to main list after initialization

planet2 = Planet("KHM-4", "description", "mineral", 100, 100, 100, leaderList[1])
planetList.append(planet2)

planet3 = Planet("Pyrathis", "description", "fuel", 100, 100, 100, leaderList[0])
planetList.append(planet3)

planet4 = Planet("Nalathis","description","manufacture", 100, 100, 100, leaderList[1])
planetList.append(planet4)

planet5 = Planet("Pharis", "description", "medical", 100, 100, 100, leaderList[0])
planetList.append(planet5)
