SELECT pl.id, pl.ign, a.status
FROM Applies a
JOIN Player pl ON a.player_id = pl.id
JOIN Party p ON a.party_id = p.id
WHERE p.id = 3 AND p.status = 'Ended' AND a.status IN ('Accepted', 'Kicked');