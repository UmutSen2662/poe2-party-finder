-- 1. INDEPENDENT TABLES (Reference & Core Data)

CREATE TABLE Account (
    id SERIAL PRIMARY KEY,
    ign VARCHAR(255) NOT NULL,
    oauth2 TEXT NOT NULL,
    templates JSONB, 
    host_rating NUMERIC(5, 2) DEFAULT 0.00,
    customer_rating NUMERIC(5, 2) DEFAULT 0.00,
    host_thumbs_up INT DEFAULT 0,
    host_thumbs_down INT DEFAULT 0,
    customer_thumbs_up INT DEFAULT 0,
    customer_thumbs_down INT DEFAULT 0
);

CREATE TABLE League (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE Currency (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255)
);

CREATE TABLE Badge (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    description TEXT,
    condition JSONB NOT NULL
);

CREATE TABLE Admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    permissions VARCHAR(255) NOT NULL
);

-- 2. INTERMEDIATE TABLES (Many-to-Many Relationships)

CREATE TABLE Badge_Category (
    badge_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (badge_id, category_id),
    FOREIGN KEY (badge_id) REFERENCES Badge(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE
);

CREATE TABLE Earns (
    account_id INT NOT NULL,
    badge_id INT NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (account_id, badge_id),
    FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES Badge(id) ON DELETE CASCADE
);

-- 3. DEPENDENT TABLES (Core Transactions)

CREATE TABLE Party (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    capacity INT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Gathering', 'Started', 'Ended')),
    cost INT NOT NULL,
    host_id INT,
    league_id INT NOT NULL,
    category_id INT NOT NULL,
    currency_id INT NOT NULL,
    FOREIGN KEY (host_id) REFERENCES Account(id) ON DELETE SET NULL,
    FOREIGN KEY (league_id) REFERENCES League(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE RESTRICT,
    FOREIGN KEY (currency_id) REFERENCES Currency(id) ON DELETE RESTRICT
);

CREATE TABLE Rating (
    id SERIAL PRIMARY KEY,
    value SMALLINT NOT NULL CHECK (value IN (1, -1)), 
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    giver_id INT,
    receiver_id INT,
    party_id INT, 
    FOREIGN KEY (giver_id) REFERENCES Account(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES Account(id) ON DELETE SET NULL,
    FOREIGN KEY (party_id) REFERENCES Party(id) ON DELETE SET NULL 
);

CREATE TABLE Applies (
    account_id INT NOT NULL,
    party_id INT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Kicked')),
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, party_id),
    FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES Party(id) ON DELETE CASCADE
);