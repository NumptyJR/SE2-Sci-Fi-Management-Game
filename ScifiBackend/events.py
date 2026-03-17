from builders import Event, Choice

eventList = []

#Add new events by following the template
#Event Template (Name, Description, Choice1, Choice2, Choice3)
event1 = Event("Astroid Shower",
      "A shower of asteroids is heading towards the planet.",
      #Choice Template (Name, Description, Resource Cost, EcomEffect, MilitaryEffect, UnrestEffect)
      Choice("Evacuation Notice", "Issue evacuation notice to affected area.", 0,-20,0,-15),
      Choice("Satellite Barrier", "Satellite belt positioned to block the shower.", -5,-40,-5,20),
      Choice("Do Nothing", "Give no warning and let the strike happen.", 0,-30,0,-40)
      )
eventList.append(event1)
#Append to main list after initialization

event2 = Event("EndTestEvent",
      "TestDescription",
      Choice("choice1", "test", -1,-100,0,0),
      Choice("choice2", "test", -2,-100,1,-2),
      Choice("choice3", "test", -3,-100,0,1)
      )
eventList.append(event2)

event3 = Event("TestName",
      "TestDescription",
      Choice("choice1", "test", -1,1,0,0),
      Choice("choice2", "test", -2,-2,1,0),
      Choice("choice3", "test", -3,0,0,1)
      )
eventList.append(event3)

event4 = Event("TestName",
      "TestDescription",
      Choice("choice1", "test", -1,1,0,0),
      Choice("choice2", "test", -2,-1,1,0),
      Choice("choice3", "test", -3,0,-1,1)
      )
eventList.append(event4)