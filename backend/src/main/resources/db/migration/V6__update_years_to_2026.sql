-- Update all data from 2025 to 2026
UPDATE projects SET start_year = 2026, end_year = 2026 WHERE start_year = 2025;
UPDATE bids SET start_year = 2026, end_year = 2026 WHERE start_year = 2025;
UPDATE assignments SET start_year = 2026, end_year = 2026 WHERE start_year = 2025;
