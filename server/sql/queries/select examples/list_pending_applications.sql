SELECT pl.ign, a.status, a.applied_at, pl.customer_rating
FROM Applies a
JOIN Player pl ON a.player_id = pl.id
WHERE a.party_id = 1 AND a.status = 'Pending'
ORDER BY a.applied_at ASC;