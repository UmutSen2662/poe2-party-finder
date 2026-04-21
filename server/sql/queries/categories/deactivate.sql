UPDATE category
SET status = 'Inactive'
WHERE id = $1
RETURNING id, name, image, status;
