-- 1. REFERENCE DATA (Leagues, Categories, Currencies)

INSERT INTO League (name, status) VALUES 
('Standard', 'Active'),
('Hardcore', 'Active'),
('Fate of the Vaal', 'Active'),
('Fate of the Vaal - HC', 'Inactive');

INSERT INTO Category (name, image, status) VALUES 
('Vaal Temple', 'vaal_temple.png', 'Active'),
('Arbiter', 'arbiter.png', 'Active'),
('Leveling', 'leveling.png', 'Active'),
('Xesth', 'xesth.png', 'Active'),
('King of the Mists', 'king_of_the_mists.png', 'Active'),
('Olroth', 'olroth.png', 'Active'),
('Gold', 'gold.png', 'Active');

INSERT INTO Currency (name, icon) VALUES 
('Chaos Orb', 'chaos.png'),
('Divine Orb', 'divine.png'),
('Exalted Orb', 'exalt.png');

-- 2. SYSTEM DATA (Admins & Badges)

INSERT INTO Admin (email, password, permissions) VALUES 
('admin@poe2party.com', 'hashed_secure_password_123', 'Superadmin'),
('mod@poe2party.com', 'hashed_secure_password_456', 'Moderator');

INSERT INTO Badge (name, icon, description, condition) VALUES 
('King Slayer', 'slayer_badge.png', 'Successfully host 50 King of the Mists carries.', '{"target": 50, "metric": "successful_runs"}'),
('Master Mentor', 'guide_badge.png', 'Maintain a 9.50 positive rating over 100 Leveling runs.', '{"target": 9.50, "metric": "rating_score"}');

INSERT INTO Badge_Category (badge_id, category_id) VALUES 
(1, 5), -- King Slayer is linked to King of the Mists
(2, 3); -- Master Mentor is linked to Leveling

-- 3. PLAYERS

INSERT INTO player (ign, oauth2, templates, host_rating, customer_rating, host_thumbs_up, host_thumbs_down, customer_thumbs_up, customer_thumbs_down) VALUES 
('Emre', 'oauth_token_111', '[{"name": "Fast Olroth", "text": "WTS Olroth Kill, fast and safe."}]'::jsonb, 9.85, 10.00, 150, 2, 45, 0),
('Umut', 'oauth_token_222', '[{"name": "Gold Farm", "text": "Hosting Gold runs, AFK spot."}]'::jsonb, 9.20, 8.85, 85, 8, 20, 3),
('NoobPlayer', 'oauth_token_333', '[]'::jsonb, 0.00, 10.00, 0, 0, 15, 0),
('ToxicPlayer', 'oauth_token_444', '[]'::jsonb, 4.50, 3.00, 10, 12, 5, 10);

-- Award badges to players
INSERT INTO Earns (player_id, badge_id, pinned) VALUES 
(1, 1, TRUE),  -- Emre pins the King Slayer badge
(2, 2, FALSE); -- Umut has Master Mentor, but not pinned

-- 4. CORE TRANSACTIONS (Parties, Applies, Ratings)

-- Create Lobbies (Parties)
INSERT INTO Party (title, description, capacity, status, cost, host_id, league_id, category_id, currency_id) VALUES 
('Olroth Kill - EU Server', 'Bring your own entry, stay dead if you die.', 5, 'Gathering', 2, 1, 3, 6, 2), -- Party 1: Active gathering lobby (Hosted by Emre), 2 Divine Orbs, Fate of the Vaal, Olroth Carry
('Gold Farm - 5 runs', 'Resetting fast, stay AFK.', 5, 'Started', 50, 2, 1, 7, 1), -- Party 2: Active started lobby (Hosted by Umut, queue is locked), 50 Chaos Orbs, Standard, Gold Run
('King of the Mists Carry', 'Quick kill.', 5, 'Ended', 1, 1, 1, 5, 2); -- Party 3: Completed lobby to test ratings (Hosted by Emre), King of the Mists

-- Customers Apply to Lobbies
INSERT INTO Applies (player_id, party_id, status) VALUES 
-- Applications to Party 1 (Gathering)
(2, 1, 'Pending'),
(3, 1, 'Accepted'),

-- Applications to Party 2 (Started)
(3, 2, 'Accepted'),
(4, 2, 'Rejected'), -- ToxicPlayer got rejected

-- Applications to Party 3 (Ended)
(3, 3, 'Accepted'),
(4, 3, 'Accepted');

-- Post-Run Ratings (For Party 3, which has 'Ended')
INSERT INTO Rating (value, giver_id, receiver_id, party_id) VALUES 
(1, 3, 1, 3),  -- NoobPlayer gives Emre a Thumbs Up (Host Rating)
(1, 1, 3, 3),  -- Emre gives NoobPlayer a Thumbs Up (Customer Rating)
(-1, 4, 1, 3), -- ToxicPlayer gives Emre a Thumbs Down (Host Rating)
(-1, 1, 4, 3); -- Emre gives ToxicPlayer a Thumbs Down (Customer Rating)