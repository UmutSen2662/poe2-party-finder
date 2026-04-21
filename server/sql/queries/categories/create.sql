INSERT INTO category (name, image, status)
VALUES ($1, $2, $3)
RETURNING id, name, image, status;
