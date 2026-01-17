-- Purge des données anciennes pour libérer de l'espace disque

-- 1. Supprimer les alertes de plus de 30 jours
DELETE FROM emptyleg_alerts 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 2. Supprimer les vols bruts de plus de 60 jours
DELETE FROM flights_raw 
WHERE fetched_at < NOW() - INTERVAL '60 days';

-- 3. Supprimer les événements de vols de plus de 60 jours
DELETE FROM flights_events 
WHERE created_at < NOW() - INTERVAL '60 days';

-- 4. Supprimer les logs d'ingestion de plus de 7 jours
DELETE FROM ingest_logs 
WHERE ts < NOW() - INTERVAL '7 days';