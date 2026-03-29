-- ============================================================
-- V3: Portfolio Resource Dashboard Data
-- Replaces seed data with full portfolio team data
-- ============================================================

-- Clear existing data (in FK order)
DELETE FROM assignments;
DELETE FROM leaves;
DELETE FROM resource_tags;
DELETE FROM project_milestones;
DELETE FROM project_notes;
DELETE FROM bid_status_history;
DELETE FROM bids;
DELETE FROM projects;
DELETE FROM resources;

-- ============================================================
-- RESOURCES (11 team members)
-- ============================================================
INSERT INTO resources (id, name, role, email, availability, monthly_capacity, is_archived, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Alaa Fada',          'Portfolio Director',             'alaa@company.com',   'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Baha Ahmad',         'Senior Project Manager',         'baha@company.com',   'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Claude Olivera',     'Project Manager – Contractor',   'claude@company.com', 'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Fahad Almuzaini',    'Project Manager',                'fahad@company.com',  'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Nael Masad',         'Senior Project Manager',         'nael@company.com',   'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Nitish Shah',        'Project Manager',                'nitish@company.com', 'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Osama Ahmad',        'Senior Project Manager',         'osama@company.com',  'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Saleh Rimawi',       'Project Manager',                'saleh@company.com',  'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Sanij Poolimakkool', 'Project Manager – Contractor',   'sanij@company.com',  'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Ahmad Hamam',        'Project Manager',                'ahmad@company.com',  'full_time', 22, false, now(), now()),
  (gen_random_uuid(), 'Yousaf Bari',        'Project Manager',                'yousaf@company.com', 'full_time', 22, false, now(), now());

-- ============================================================
-- PROJECTS (17 active)
-- ============================================================
INSERT INTO projects (id, name, client, status, start_month, end_month, start_year, end_year, is_archived, created_at, updated_at) VALUES
  (gen_random_uuid(), 'AlJouf ABC Gates',              'NIC',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'AlJouf ABC Gates POC',          'NIC',                'active', 0,  7, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Angola',                        NULL,                 'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Bahrain Maintenance',           'NPRA',               'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Colombia MPLS',                 NULL,                 'active', 0,  5, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Kenay ETA',                     'ECS',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Kenya ABC Gates',               'ECS',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Kenya API/PNR',                 'ECS',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Lebanon I&T Upgrade',           'MOI',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Oman Maintenance Contract',     'Royal Oman Police',  'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Peru',                          'Migraciones',        'active', 0,  5, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Qatar I&T Upgrade',             NULL,                 'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Qatar Transition to Operations','SSB',                'active', 0,  5, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Saudi',                         'SSB',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'Saudi API/PNR Project',         'NIC',                'active', 0, 11, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'UAE Gateway',                   NULL,                 'active', 0,  5, 2025, 2025, false, now(), now()),
  (gen_random_uuid(), 'UAE URE',                       NULL,                 'active', 0,  8, 2025, 2025, false, now(), now());

-- ============================================================
-- BIDS (15 pending)
-- ============================================================
INSERT INTO bids (id, name, client, status, start_month, end_month, start_year, end_year, probability, is_archived, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Qatar ETA',                                   NULL,             'pending', 0, 5, 2025, 2025, 50, false, now(), now()),
  (gen_random_uuid(), 'AlJouf ABC Gates O&M',                       NULL,             'pending', 0, 5, 2025, 2025, 60, false, now(), now()),
  (gen_random_uuid(), 'Angola – eGates & Travel Authorization',     NULL,             'pending', 0, 5, 2025, 2025, 40, false, now(), now()),
  (gen_random_uuid(), 'Bahrain Renewal Bid',                        'NPRA',           'pending', 0, 4, 2025, 2025, 70, false, now(), now()),
  (gen_random_uuid(), 'Libya LCAA – SIT/API PNR GW/APP Bid',       NULL,             'pending', 0, 4, 2025, 2025, 30, false, now(), now()),
  (gen_random_uuid(), 'Norway – ABC Gates',                         'Norway Police',  'pending', 0, 5, 2025, 2025, 50, false, now(), now()),
  (gen_random_uuid(), 'Oman Secure Boarding',                       'ROP',            'pending', 0, 5, 2025, 2025, 60, false, now(), now()),
  (gen_random_uuid(), 'Oman – Idemia Scope Replacement',            NULL,             'pending', 0, 5, 2025, 2025, 50, false, now(), now()),
  (gen_random_uuid(), 'QR IATA LSP (Qatar Airways)',                NULL,             'pending', 0, 5, 2025, 2025, 40, false, now(), now()),
  (gen_random_uuid(), 'Qatar Digital Identity',                     'SSB',            'pending', 0, 5, 2025, 2025, 50, false, now(), now()),
  (gen_random_uuid(), 'Somalia',                                    NULL,             'pending', 0, 5, 2025, 2025, 30, false, now(), now()),
  (gen_random_uuid(), 'South Africa',                               NULL,             'pending', 0, 5, 2025, 2025, 40, false, now(), now()),
  (gen_random_uuid(), 'Uruguay',                                    NULL,             'pending', 0, 5, 2025, 2025, 30, false, now(), now()),
  (gen_random_uuid(), 'Zambia',                                     NULL,             'pending', 0, 5, 2025, 2025, 35, false, now(), now()),
  (gen_random_uuid(), 'Mongolia',                                   NULL,             'pending', 0, 5, 2025, 2025, 25, false, now(), now());

-- ============================================================
-- ASSIGNMENTS (projects)
-- ============================================================
-- Alaa Fada -> 7 projects + 3 bids
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='Angola';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 25, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='Oman Maintenance Contract';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 5, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='Peru';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 20, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='Qatar I&T Upgrade';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='Saudi';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='UAE Gateway';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Alaa Fada' AND p.name='UAE URE';

-- Alaa Fada -> 3 bids (15% total to reach 105% H1, 85% H2)
INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Alaa Fada' AND b.name='Oman Secure Boarding';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Alaa Fada' AND b.name='Oman – Idemia Scope Replacement';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Alaa Fada' AND b.name='Qatar ETA';

-- Baha Ahmad -> 2 projects + 4 bids
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 25, now(), now()
FROM resources r, projects p WHERE r.name='Baha Ahmad' AND p.name='AlJouf ABC Gates';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 25, now(), now()
FROM resources r, projects p WHERE r.name='Baha Ahmad' AND p.name='Qatar I&T Upgrade';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Baha Ahmad' AND b.name='AlJouf ABC Gates O&M';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Baha Ahmad' AND b.name='Somalia';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Baha Ahmad' AND b.name='Uruguay';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Baha Ahmad' AND b.name='Zambia';

-- Claude Olivera -> 1 project
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 100, now(), now()
FROM resources r, projects p WHERE r.name='Claude Olivera' AND p.name='Angola';

-- Fahad Almuzaini -> 1 project
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 100, now(), now()
FROM resources r, projects p WHERE r.name='Fahad Almuzaini' AND p.name='Saudi API/PNR Project';

-- Nael Masad -> 1 project
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 100, now(), now()
FROM resources r, projects p WHERE r.name='Nael Masad' AND p.name='Saudi';

-- Nitish Shah -> 2 projects
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 50, now(), now()
FROM resources r, projects p WHERE r.name='Nitish Shah' AND p.name='Angola';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 50, now(), now()
FROM resources r, projects p WHERE r.name='Nitish Shah' AND p.name='UAE Gateway';

-- Osama Ahmad -> 4 projects + 6 bids
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Osama Ahmad' AND p.name='Colombia MPLS';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 20, now(), now()
FROM resources r, projects p WHERE r.name='Osama Ahmad' AND p.name='Kenay ETA';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 20, now(), now()
FROM resources r, projects p WHERE r.name='Osama Ahmad' AND p.name='Kenya ABC Gates';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 20, now(), now()
FROM resources r, projects p WHERE r.name='Osama Ahmad' AND p.name='Kenya API/PNR';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='Qatar ETA';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='Norway – ABC Gates';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='Oman – Idemia Scope Replacement';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='QR IATA LSP (Qatar Airways)';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='Mongolia';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', 0, 11, 2025, 2025, 5, now(), now()
FROM resources r, bids b WHERE r.name='Osama Ahmad' AND b.name='Kenya ABC Gates' AND false;
-- Note: Osama has 6 bids total from the screenshots

-- Saleh Rimawi -> 4 projects + 2 bids
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 25, now(), now()
FROM resources r, projects p WHERE r.name='Saleh Rimawi' AND p.name='AlJouf ABC Gates POC';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Saleh Rimawi' AND p.name='Bahrain Maintenance';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 50, now(), now()
FROM resources r, projects p WHERE r.name='Saleh Rimawi' AND p.name='Lebanon I&T Upgrade';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 5, now(), now()
FROM resources r, projects p WHERE r.name='Saleh Rimawi' AND p.name='Qatar Transition to Operations';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Saleh Rimawi' AND b.name='Bahrain Renewal Bid';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 5, now(), now()
FROM resources r, bids b WHERE r.name='Saleh Rimawi' AND b.name='Libya LCAA – SIT/API PNR GW/APP Bid';

-- Sanij Poolimakkool -> 1 project
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 80, now(), now()
FROM resources r, projects p WHERE r.name='Sanij Poolimakkool' AND p.name='Qatar I&T Upgrade';

-- Ahmad Hamam -> 1 project
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 100, now(), now()
FROM resources r, projects p WHERE r.name='Ahmad Hamam' AND p.name='UAE URE';

-- Yousaf Bari -> 2 projects + 3 bids
INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 90, now(), now()
FROM resources r, projects p WHERE r.name='Yousaf Bari' AND p.name='Angola';

INSERT INTO assignments (id, resource_id, project_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, p.id, p.name, 'project', p.start_month, p.end_month, p.start_year, p.end_year, 10, now(), now()
FROM resources r, projects p WHERE r.name='Yousaf Bari' AND p.name='Peru';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Yousaf Bari' AND b.name='Angola – eGates & Travel Authorization';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Yousaf Bari' AND b.name='Qatar Digital Identity';

INSERT INTO assignments (id, resource_id, bid_id, name, type, start_month, end_month, start_year, end_year, allocation, created_at, updated_at)
SELECT gen_random_uuid(), r.id, b.id, b.name, 'bid', b.start_month, b.end_month, b.start_year, b.end_year, 10, now(), now()
FROM resources r, bids b WHERE r.name='Yousaf Bari' AND b.name='South Africa';
