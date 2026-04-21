UPDATE category
SET
  name = COALESCE($2, name),
  image = COALESCE($3, image),
  status = COALESCE($4, status)
WHERE id = $1
RETURNING id, name, image, status;
