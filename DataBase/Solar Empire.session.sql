-- ==============================================================================
-- Solar Empire Game Database Schema
-- Author: Joshua Schaff
-- Date: 2026-03-07
-- Email: 0303308s@acadiau.ca
-- Version: 1.0.0
-- ==============================================================================
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS game_turn_history CASCADE;
DROP TABLE IF EXISTS game_planet_needs CASCADE;
DROP TABLE IF EXISTS game_state_inventory CASCADE;
DROP TABLE IF EXISTS game_state_planet CASCADE;
DROP TABLE IF EXISTS event_option CASCADE;
DROP TABLE IF EXISTS event_template CASCADE;
DROP TABLE IF EXISTS leader_template CASCADE;
DROP TABLE IF EXISTS planet_template CASCADE;
DROP TABLE IF EXISTS resource_type CASCADE;
DROP TABLE IF EXISTS corporation CASCADE;
DROP TABLE IF EXISTS race CASCADE;
DROP TABLE IF EXISTS game_session CASCADE;
-- ==============================================================================
-- 1. STATIC CONFIGURATION TABLES
-- ==============================================================================
CREATE TABLE race (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
CREATE TABLE corporation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
CREATE TABLE resource_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
CREATE TABLE planet_template (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    planet_type VARCHAR(100),
    primary_output_resource_id INT REFERENCES resource_type(id),
    population_billions NUMERIC(5, 2),
    is_capitol BOOLEAN DEFAULT FALSE,
    description TEXT,
    role_description TEXT
);
CREATE TABLE leader_template (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    race_id INT REFERENCES race(id),
    planet_template_id INT REFERENCES planet_template(id),
    -- If they are specific to a planet
    corporation_id INT REFERENCES corporation(id),
    -- If they are a corporate leader
    description TEXT,
    attributes_summary TEXT
);
CREATE TABLE event_template (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    location_scope VARCHAR(50) CHECK (
        location_scope IN ('system', 'planet', 'station', 'deep_space')
    ),
    description TEXT
);
CREATE TABLE event_option (
    id SERIAL PRIMARY KEY,
    event_template_id INT REFERENCES event_template(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost_credits INT DEFAULT 0,
    effect_military INT DEFAULT 0,
    effect_unrest INT DEFAULT 0,
    effect_economy INT DEFAULT 0,
    effect_stability INT DEFAULT 0,
    effect_planet_chaos INT DEFAULT 0
);
-- ==============================================================================
-- 2. DYNAMIC STATE TABLES
-- ==============================================================================
-- Represents a single playthrough of the game.
CREATE TABLE game_session (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100),
    current_turn INT DEFAULT 1 CHECK (current_turn <= 15),
    credits INT DEFAULT 100,
    economy_health INT DEFAULT 100,
    military_power INT DEFAULT 100,
    civil_unrest INT DEFAULT 0,
    stability INT DEFAULT 100,
    game_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (game_status IN ('ACTIVE', 'WON', 'LOST')),
    sovereign_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tracks the current status of each planet in a specific game session.
CREATE TABLE game_state_planet (
    id SERIAL PRIMARY KEY,
    game_session_id INT REFERENCES game_session(id) ON DELETE CASCADE,
    planet_template_id INT REFERENCES planet_template(id),
    current_leader_id INT REFERENCES leader_template(id),
    chaos_meter INT DEFAULT 0 CHECK (
        chaos_meter >= 0
        AND chaos_meter <= 100
    ),
    is_revolting BOOLEAN DEFAULT FALSE,
    UNIQUE(game_session_id, planet_template_id)
);
-- Tracks active resource demands per planet for the current turn.
CREATE TABLE game_planet_needs (
    id SERIAL PRIMARY KEY,
    game_session_id INT REFERENCES game_session(id) ON DELETE CASCADE,
    game_state_planet_id INT REFERENCES game_state_planet(id) ON DELETE CASCADE,
    turn_number INT NOT NULL,
    resource_type_id INT REFERENCES resource_type(id),
    amount_needed INT DEFAULT 0,
    is_met BOOLEAN DEFAULT FALSE
);
-- The empire's overall system resource inventory per game.
CREATE TABLE game_state_inventory (
    game_session_id INT REFERENCES game_session(id) ON DELETE CASCADE,
    resource_type_id INT REFERENCES resource_type(id),
    amount INT DEFAULT 0,
    PRIMARY KEY (game_session_id, resource_type_id)
);
-- Historical log of everything that happens per turn.
CREATE TABLE game_turn_history (
    id SERIAL PRIMARY KEY,
    game_session_id INT REFERENCES game_session(id) ON DELETE CASCADE,
    turn_number INT NOT NULL,
    -- System Event Phase decisions
    event_template_id INT REFERENCES event_template(id),
    selected_option_id INT REFERENCES event_option(id),
    -- Track stat differentials for the turn
    credits_change INT DEFAULT 0,
    economy_change INT DEFAULT 0,
    military_change INT DEFAULT 0,
    unrest_change INT DEFAULT 0,
    stability_change INT DEFAULT 0,
    -- Turn Outcome Snapshot
    snapshot_credits INT,
    snapshot_economy INT,
    snapshot_military INT,
    snapshot_civil_unrest INT,
    snapshot_stability INT,
    summary_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ==============================================================================
-- 3. SEED DATA
-- ==============================================================================
-- Seed Races
INSERT INTO race (name, description)
VALUES (
        'Human',
        'They''re humans. We know how they work.'
    ),
    (
        'Drahnox',
        'Pale, humanoid race, extremely large muscle mass. Bred to be ultimate killing machines. Worship a goddess of death.'
    ),
    (
        'Android',
        'Synthetic lifeforms operating on logic and efficiency.'
    ),
    (
        'Seric',
        'Alien Race. Known for their distinct culture and presence across the system.'
    );
-- Seed Corporations
INSERT INTO corporation (name, description)
VALUES (
        'The Andromeda Corporation',
        'A top corporation in the galaxy, led by the Andromeda family currently seeking total market dominance.'
    ),
    (
        'Synapse Industries',
        'An android-led corporation competing fiercely with Andromeda Corp for economic control.'
    );
-- Seed Resource Types
INSERT INTO resource_type (name, description)
VALUES ('Rations', 'Prevents starvation and unrest'),
    (
        'Minerals',
        'Used for infrastructure and weapons manufacturing'
    ),
    ('Fuel', 'Supports fleets and transportation'),
    (
        'Manufactured Goods',
        'Supports economic productivity'
    ),
    (
        'Medical Supplies',
        'Prevents health crises and reduces unrest'
    );
-- Seed Planets
INSERT INTO planet_template (
        name,
        planet_type,
        population_billions,
        is_capitol,
        role_description,
        description
    )
VALUES (
        'Nalathis',
        'Icy / Military',
        2.4,
        FALSE,
        'Military output, training skilled fleet members.',
        'Furthest from the core star. Oceans are frozen over making fresh water scarce.'
    ),
    (
        'KHM-4',
        'Dense Mineral World',
        NULL,
        FALSE,
        'Industrial backbone. Supplies minerals and metals.',
        'Formed in a violent debris field. Centuries of strip-mining scarred the surface, making it more machine than planet.'
    ),
    (
        'Fol',
        'Agricultural / Barren',
        NULL,
        FALSE,
        'Food and water production and distribution.',
        'Terraformed desert with green spheres maintaining control climates. Faces threats from solar flares.'
    ),
    (
        'Pyrathis',
        'Energy World',
        NULL,
        FALSE,
        'Energy capital. Fuel for starships and plasma cores.',
        'Crust is split open, oceans of magma. Androids constructed surface refiners here.'
    ),
    (
        'Pharis',
        'Capitol / Densely Populated',
        NULL,
        TRUE,
        'Capitol planet. Hub for central intelligence and medical tech.',
        'Mega cities and neon hues. Instability here can quickly send other planets into unrest, ending the empire.'
    );
-- Assign Primary Resources to Planets
UPDATE planet_template
SET primary_output_resource_id = (
        SELECT id
        FROM resource_type
        WHERE name = 'Manufactured Goods'
    )
WHERE name = 'Nalathis';
UPDATE planet_template
SET primary_output_resource_id = (
        SELECT id
        FROM resource_type
        WHERE name = 'Minerals'
    )
WHERE name = 'KHM-4';
UPDATE planet_template
SET primary_output_resource_id = (
        SELECT id
        FROM resource_type
        WHERE name = 'Rations'
    )
WHERE name = 'Fol';
UPDATE planet_template
SET primary_output_resource_id = (
        SELECT id
        FROM resource_type
        WHERE name = 'Fuel'
    )
WHERE name = 'Pyrathis';
UPDATE planet_template
SET primary_output_resource_id = (
        SELECT id
        FROM resource_type
        WHERE name = 'Medical Supplies'
    )
WHERE name = 'Pharis';
-- Seed Leaders (Governors)
-- Nalathis Leaders
INSERT INTO leader_template (
        name,
        title,
        race_id,
        planet_template_id,
        attributes_summary
    )
VALUES (
        'Sidis Hronar',
        'Fleet General',
        (
            SELECT id
            FROM race
            WHERE name = 'Drahnox'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Nalathis'
        ),
        'Low manufactured goods output and slow chaos growth.'
    ),
    (
        'Dustie-87',
        'War Strategist',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Nalathis'
        ),
        'Increased manufactured goods output and high starting chaos.'
    ),
    (
        'Nathan Andromeda',
        'Corporate Higher-Up',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Nalathis'
        ),
        'Maximum manufactured goods output and chaos on the brink of collapse.'
    );
-- KHM-4 Leaders
INSERT INTO leader_template (
        name,
        title,
        race_id,
        planet_template_id,
        attributes_summary
    )
VALUES (
        'Marshal-Executor Varyn Khol',
        'Authoritarian Industrialist',
        NULL,
        (
            SELECT id
            FROM planet_template
            WHERE name = 'KHM-4'
        ),
        '+40% mining output, raises unrest due to unsafe working conditions.'
    ),
    (
        'Director Selene Myr',
        'Corporate Technocrat',
        NULL,
        (
            SELECT id
            FROM planet_template
            WHERE name = 'KHM-4'
        ),
        'Balanced mining output, slower unrest growth.'
    ),
    (
        'Prophet Dax Orun',
        'Worker Populist Leader',
        NULL,
        (
            SELECT id
            FROM planet_template
            WHERE name = 'KHM-4'
        ),
        'Very low unrest growth, lower mining output.'
    );
-- Fol Leaders
INSERT INTO leader_template (
        name,
        title,
        race_id,
        planet_template_id,
        attributes_summary
    )
VALUES (
        'Cheri Sol-Ci',
        'Leading Botanist',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Fol'
        ),
        'High Ration yield, Low supply chain defense, doesn''t manage planetary unrest well.'
    ),
    (
        'Fori Dxylon',
        'Native Leader',
        (
            SELECT id
            FROM race
            WHERE name = 'Seric'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Fol'
        ),
        'Average Ration yield, average supply chain defense.'
    ),
    (
        'DX-44',
        'Unpopular Administrator',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Fol'
        ),
        'High Ration yield, high supply chain defense, very unpopular.'
    );
-- Pyrathis Leaders
INSERT INTO leader_template (
        name,
        title,
        race_id,
        planet_template_id,
        attributes_summary
    )
VALUES (
        'Vortex',
        'Maximum Power Projection',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pyrathis'
        ),
        'High fuel production, higher chance of civil unrest.'
    ),
    (
        'LUMA-9',
        'Stable Systems Operator',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pyrathis'
        ),
        'Balanced fuel production, mid chance of civil unrest.'
    ),
    (
        'KDR-AXIS',
        'Cooperative Operator',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pyrathis'
        ),
        'Lower fuel production, low chance of civil unrest.'
    );
-- Pharis Leaders
INSERT INTO leader_template (
        name,
        title,
        race_id,
        planet_template_id,
        attributes_summary
    )
VALUES (
        'Chris Steffin',
        'Career Politician',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pharis'
        ),
        'Popular, manages unrest effectively. Low Medical Tech yield. Higher chance of scandal.'
    ),
    (
        'Fruji Jon-Joko',
        'Alien Leader',
        (
            SELECT id
            FROM race
            WHERE name = 'Seric'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pharis'
        ),
        'High Medical Tech yield. Low chance of public scandal event.'
    ),
    (
        'Jane Mercer',
        'Popular Figure',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        (
            SELECT id
            FROM planet_template
            WHERE name = 'Pharis'
        ),
        'Average Medical Tech, Low scandal chance. Secret resistance member, can cause coup event.'
    );
-- Space Station (Beacon Outpost) Leaders - Not strictly bound to a planet
INSERT INTO leader_template (
        name,
        title,
        race_id,
        corporation_id,
        attributes_summary
    )
VALUES (
        'Dracaryn Andromeda',
        'CEO of Andromeda Corp',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        (
            SELECT id
            FROM corporation
            WHERE name = 'The Andromeda Corporation'
        ),
        'Lower prices, higher chaos.'
    ),
    (
        'Nervan Prime',
        'CEO of Synapse Industries',
        (
            SELECT id
            FROM race
            WHERE name = 'Android'
        ),
        (
            SELECT id
            FROM corporation
            WHERE name = 'Synapse Industries'
        ),
        'Lower prices, higher chaos.'
    ),
    (
        'Daedric Edgedancer',
        'Isolationist Investor',
        (
            SELECT id
            FROM race
            WHERE name = 'Human'
        ),
        NULL,
        'Balanced prices and chaos.'
    );
-- Seed Default Example Event
INSERT INTO event_template (title, location_scope, description)
VALUES (
        'Pirate Raid on KHM-4',
        'planet',
        'Pirate fleets have begun attacking mineral transport convoys leaving the planet''s orbital shipyards.'
    );
-- Seed Event Options for the Event
INSERT INTO event_option (
        event_template_id,
        description,
        cost_credits,
        effect_military,
        effect_unrest,
        effect_economy
    )
VALUES (
        (
            SELECT id
            FROM event_template
            WHERE title = 'Pirate Raid on KHM-4'
        ),
        'Deploy Fleet',
        15,
        -3,
        2,
        0
    ),
    (
        (
            SELECT id
            FROM event_template
            WHERE title = 'Pirate Raid on KHM-4'
        ),
        'Ignore the Raid',
        0,
        0,
        5,
        -5
    ),
    (
        (
            SELECT id
            FROM event_template
            WHERE title = 'Pirate Raid on KHM-4'
        ),
        'Emergency Trade Rerouting',
        25,
        -1,
        1,
        4
    );