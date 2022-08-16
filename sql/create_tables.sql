-- Creation of events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    sim_card_id TEXT NOT NULL,
    bytes_used INT NOT NULL,
    date_time timestamp NOT NULL
);

-- Creation of SIM Card Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    sim_card_id TEXT NOT NULL,
    org_id TEXT NOT NULL,
    PRIMARY KEY (sim_card_id)
);
