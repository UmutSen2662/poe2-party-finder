SELECT CONCAT('@', pl.ign, ' Hi, I would like to join your ', c.name, ' party for ', p.cost, ' ', cur.name) AS whisper_message
FROM Party p
JOIN Player pl ON p.host_id = pl.id
JOIN Category c ON p.category_id = c.id
JOIN Currency cur ON p.currency_id = cur.id
WHERE p.id = 1;