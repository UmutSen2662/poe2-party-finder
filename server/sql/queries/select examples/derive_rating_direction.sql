SELECT r.value, r.timestamp, giver.ign AS rater, receiver.ign AS rated_player,
    CASE 
        WHEN r.giver_id = p.host_id THEN 'Host-to-Customer'
        ELSE 'Customer-to-Host'
    END AS rating_direction
FROM Rating r
JOIN Party p ON r.party_id = p.id
JOIN Player giver ON r.giver_id = giver.id
JOIN Player receiver ON r.receiver_id = receiver.id
WHERE p.id = 3;