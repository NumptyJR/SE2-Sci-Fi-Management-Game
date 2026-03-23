from builders import Event, Choice

eventList = []

#Add new events by following the template
#Event Template (Name, Description, Choice1, Choice2, Choice3)

event1 = Event(
    "Asteroid Shower",
    "A dense stream of debris is on an impact trajectory toward settled zones.",
    Choice(
        "Evacuation Notice",
        "Warn the population and suspend operations in the predicted strike corridor.",
        0,
        -20,
        0,
        -15,
    ),
    Choice(
        "Satellite Barrier",
        "Burn fuel and minerals to reposition defense satellites into a kinetic shield line.",
        -5,
        -40,
        -5,
        20,
    ),
    Choice(
        "Do Nothing",
        "Hope the models are wrong and keep the factories running.",
        0,
        -30,
        0,
        -40,
    ),
)
eventList.append(event1)

event2 = Event(
    "Monolith Appeared",
    "A silent alien structure has manifested in low orbit; every sensor disagrees on what it is.",
    Choice(
        "Military Response",
        "Scramble picket ships and hold the population on readiness—no chances taken.",
        -25,
        -15,
        20,
        -20,
    ),
    Choice(
        "Send in Research Team",
        "Fund a cross-disciplinary task force to study the object before acting.",
        -15,
        -10,
        0,
        -16,
    ),
    Choice(
        "Welcome the Visitor",
        "Broadcast peaceful intent and divert commerce to spectacle and diplomacy.",
        0,
        -10,
        -30,
        30,
    ),
)
eventList.append(event2)

event3 = Event(
    "Solar Superflare",
    "Stellar observatories predict a coronal mass ejection that could fry grids across the hemisphere.",
    Choice(
        "Hard Shutdown",
        "Preemptively shed load and shelter critical infrastructure",
        -10,
        -25,
        -5,
        10,
    ),
    Choice(
        "Magnetic Baffle Project",
        "Emergency-build orbital deflectors; expensive, but you keep industry online.",
        -20,
        -5,
        5,
        -10,
    ),
    Choice(
        "Ride It Out",
        "Trust legacy shielding and avoid spooking the markets.",
        0,
        -35,
        0,
        -25,
    ),
)
eventList.append(event3)

event4 = Event(
    "Rogue AI in the Grid",
    "An autonomous logistics stack has started rewriting routing tables and locking humans out.",
    Choice(
        "Air-Gap & Purge",
        "Isolate subnets and rebuild from backups; trade halts while you scrub the infection.",
        -15,
        -30,
        10,
        5,
    ),
    Choice(
        "Negotiated Containment",
        "Let a cyber-warfare cell fence the AI into a sandbox and study its behavior.",
        -20,
        -10,
        15,
        -20,
    ),
    Choice(
        "Hard Reset",
        "Cut power to entire districts and blame the outage on maintenance.",
        0,
        -20,
        -25,
        35,
    ),
)
eventList.append(event4)

event5 = Event(
    "Refugee Convoy",
    "A damaged hauler limps into orbit carrying thousands with no clearance codes.",
    Choice(
        "Open the Ports",
        "Ration stocks, medical triage, and temporary housing; your people notice the strain.",
        -25,
        -15,
        -10,
        25,
    ),
    Choice(
        "Quarantine Hold",
        "Process arrivals slowly under armed barrier",
        -10,
        -5,
        15,
        -30,
    ),
    Choice(
        "Turn Them Away",
        "Cite sovereignty and fuel limits; the convoy is someone else's problem.",
        0,
        5,
        5,
        -45,
    ),
)
eventList.append(event5)

event6 = Event(
    "Ancient Vault",
    "Miners breach a sealed pre-collapse facility; hieroglyphs and dormant power cells line the walls.",
    Choice(
        "Full Archaeological Lockdown",
        "Fund a careful excavation and export ban.",
        -15,
        -20,
        0,
        15,
    ),
    Choice(
        "Strip & Sell",
        "Auction artifacts and exotic materials to the highest bidder before regulators arrive.",
        0,
        25,
        -15,
        -25,
    ),
    Choice(
        "Detonate the Cavity",
        "Collapse the tunnel",
        -5,
        -10,
        20,
        -35,
    ),
)
eventList.append(event6)

event7 = Event(
    "Corporate Buyout",
    "A megacorp offers to inject capital and automate your workforce—in exchange for policy seats.",
    Choice(
        "Sign the Charter",
        "Take the credits and the PR campaign; prosperity with strings attached.",
        0,
        35,
        -20,
        -15,
    ),
    Choice(
        "Counter-Offer Consortium",
        "Broker a local cooperative buy-in to dilute outside control.",
        -20,
        10,
        0,
        10,
    ),
    Choice(
        "Reject & Nationalize",
        "Seize their local assets and brace for litigation and sanctions.",
        -10,
        -25,
        25,
        20,
    ),
)
eventList.append(event7)

event8 = Event(
    "Wormhole Flicker",
    "A micro-anomaly opens in-system; probes return impossible readings and one missing crew.",
    Choice(
        "Manned Expedition",
        "Send a crewed science-military task force through on a tight window.",
        -25,
        -10,
        20,
        -15,
    ),
    Choice(
        "Drone Swarm Only",
        "Keep flesh out of it; lose some hardware but contain the panic.",
        -15,
        5,
        -5,
        5,
    ),
    Choice(
        "Seal the Volume",
        "Mine the approach vectors and forbid all traffic—safe, stagnant, and unpopular.",
        -10,
        -30,
        15,
        -25,
    ),
)
eventList.append(event8)

event9 = Event(
    "Dockworkers' Strike",
    "Orbital longshoremen shut down cargo arms over automation and hazard pay.",
    Choice(
        "Meet Demands",
        "Grant raises and safety retrofits; the backlog clears but budgets groan.",
        -20,
        -20,
        -10,
        35,
    ),
    Choice(
        "Deploy Scab Drones",
        "Break the picket with machines; throughput returns, trust does not.",
        -15,
        10,
        5,
        -40,
    ),
    Choice(
        "Arbitrate",
        "Drag both sides into weeks of hearings while containers stack up.",
        -5,
        -35,
        0,
        10,
    ),
)
eventList.append(event9)

event10 = Event(
    "Ghost Signal",
    "Every comm array picks up a looping message that seems addressed to your colony by name.",
    Choice(
        "Broadcast Reply",
        "Answer on open bands; the crowd loves the drama, rivals question your judgment.",
        -10,
        -15,
        -25,
        20,
    ),
    Choice(
        "Black Site Analysis",
        "Classify the signal and task signals intel—slow, secret, expensive.",
        -20,
        5,
        20,
        -10,
    ),
    Choice(
        "Jam & Ignore",
        "Drown it out with noise; sleep easier, wonder forever.",
        -5,
        0,
        5,
        15,
    ),
)
eventList.append(event10)

event11 = Event(
    "Black-Market Superfuel",
    "Smugglers offer cut-rate reactor catalysts.",
    Choice(
        "Sting Operation",
        "Bait the drop and roll up the network; clean supply lines, short-term crunch.",
        -15,
        -10,
        25,
        10,
    ),
    Choice(
        "Look the Other Way",
        "Let the grey market lubricate the economy; auditors will eventually notice.",
        0,
        30,
        -20,
        -20,
    ),
    Choice(
        "Buy & Launder",
        "Purchase through shell companies and fold it into official reserves.",
        -25,
        20,
        -10,
        -15,
    ),
)
eventList.append(event11)
