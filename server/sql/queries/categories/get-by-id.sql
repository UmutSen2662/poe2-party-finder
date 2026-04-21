SELECT id, name, image, status
FROM category
WHERE id = $1 AND status = 'Active'
LIMIT 1;
