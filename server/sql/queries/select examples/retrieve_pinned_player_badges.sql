SELECT b.name, b.icon, b.description, e.pinned
FROM Earns e
JOIN Badge b ON e.badge_id = b.id
WHERE e.player_id = 1
ORDER BY e.pinned DESC, b.name ASC;