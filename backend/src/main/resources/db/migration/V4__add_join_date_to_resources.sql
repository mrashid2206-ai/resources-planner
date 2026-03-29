-- Add join_date to resources to track when a resource started working
ALTER TABLE resources ADD COLUMN join_date DATE;
