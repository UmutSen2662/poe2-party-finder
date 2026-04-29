SELECT p.id, p.title, p.description, p.capacity, p.cost, pl.ign AS host_name
FROM Party p
JOIN Player pl ON p.host_id = pl.id
JOIN League l ON p.league_id = l.id
JOIN Category c ON p.category_id = c.id
JOIN Currency cur ON p.currency_id = cur.id
WHERE p.status = 'Gathering' 
  AND l.name = 'Fate of the Vaal' 
  AND c.name = 'Olroth' 
  AND cur.name = 'Divine Orb';