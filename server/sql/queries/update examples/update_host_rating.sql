UPDATE Player 
SET host_thumbs_up = host_thumbs_up + 1,
    host_rating = ((host_thumbs_up + 1.0) / NULLIF(host_thumbs_up + 1 + host_thumbs_down, 0)) * 100
WHERE id = 1;