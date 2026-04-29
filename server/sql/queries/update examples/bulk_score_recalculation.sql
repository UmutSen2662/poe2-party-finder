WITH HostRatingCounts AS (
    SELECT 
        r.receiver_id,
        SUM(CASE WHEN r.value = 1 THEN 1 ELSE 0 END) AS thumbs_up,
        COUNT(*) AS total_ratings
    FROM Rating r
    JOIN Party p ON r.party_id = p.id
    WHERE p.host_id = r.receiver_id 
    GROUP BY r.receiver_id
)
UPDATE Player p
SET 
    host_thumbs_up = hrc.thumbs_up,
    host_thumbs_down = hrc.total_ratings - hrc.thumbs_up,
    host_rating = CASE 
        WHEN hrc.total_ratings = 0 THEN 0.00
        ELSE (
            ( (hrc.thumbs_up::numeric / hrc.total_ratings) + (3.8416 / (2 * hrc.total_ratings)) - 
              1.96 * SQRT(
                  ( (hrc.thumbs_up::numeric / hrc.total_ratings) * (1 - (hrc.thumbs_up::numeric / hrc.total_ratings)) / hrc.total_ratings ) + 
                  (3.8416 / (4 * hrc.total_ratings * hrc.total_ratings))
              )
            ) / (1 + (3.8416 / hrc.total_ratings))
        ) * 100 
    END
FROM HostRatingCounts hrc
WHERE p.id = hrc.receiver_id;