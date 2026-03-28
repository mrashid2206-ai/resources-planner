-- ============================================================
-- RESOURCE PLANNER PRO — PostgreSQL Database Schema
-- Version 2.0 | March 2026
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'completed');
CREATE TYPE bid_status AS ENUM ('pending', 'submitted', 'won', 'lost');
CREATE TYPE assignment_type AS ENUM ('project', 'bid');
CREATE TYPE portal_access_level AS ENUM ('read_only', 'editor');
CREATE TYPE resource_availability AS ENUM ('full_time', 'part_time');

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE resources (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(150) NOT NULL,
    role             VARCHAR(150) NOT NULL,
    email            VARCHAR(255),
    phone            VARCHAR(50),
    availability     resource_availability DEFAULT 'full_time',
    monthly_capacity INTEGER DEFAULT 22,
    hourly_rate      DECIMAL(10,2),
    avatar_url       VARCHAR(500),
    is_archived      BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_archived ON resources(is_archived);
CREATE INDEX idx_resources_name ON resources(name);

-- ============================================================
-- TAGS / SKILLS
-- ============================================================
CREATE TABLE tags (
    id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE resource_tags (
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    status        project_status DEFAULT 'active',
    start_month   INTEGER NOT NULL CHECK (start_month BETWEEN 0 AND 11),
    end_month     INTEGER NOT NULL CHECK (end_month BETWEEN 0 AND 11),
    start_year    INTEGER NOT NULL DEFAULT 2026,
    end_year      INTEGER NOT NULL DEFAULT 2026,
    budget        DECIMAL(15,2),
    budget_spent  DECIMAL(15,2) DEFAULT 0,
    client        VARCHAR(255),
    description   TEXT,
    source_bid_id UUID,
    is_archived   BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);

-- ============================================================
-- PROJECT MILESTONES
-- ============================================================
CREATE TABLE project_milestones (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    month        INTEGER NOT NULL CHECK (month BETWEEN 0 AND 11),
    year         INTEGER NOT NULL DEFAULT 2026,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT NOTES
-- ============================================================
CREATE TABLE project_notes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    author     VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BIDS
-- ============================================================
CREATE TABLE bids (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                 VARCHAR(255) NOT NULL,
    status               bid_status DEFAULT 'pending',
    start_month          INTEGER NOT NULL CHECK (start_month BETWEEN 0 AND 11),
    end_month            INTEGER NOT NULL CHECK (end_month BETWEEN 0 AND 11),
    start_year           INTEGER NOT NULL DEFAULT 2026,
    end_year             INTEGER NOT NULL DEFAULT 2026,
    estimated_value      DECIMAL(15,2),
    probability          INTEGER CHECK (probability BETWEEN 0 AND 100),
    client               VARCHAR(255),
    description          TEXT,
    win_loss_reason      TEXT,
    converted_project_id UUID REFERENCES projects(id),
    is_archived          BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_status ON bids(status);

-- ============================================================
-- BID STATUS HISTORY (Audit Trail)
-- ============================================================
CREATE TABLE bid_status_history (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id     UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    old_status bid_status,
    new_status bid_status NOT NULL,
    reason     TEXT,
    changed_by VARCHAR(150),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE assignments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
    bid_id      UUID REFERENCES bids(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    type        assignment_type NOT NULL,
    start_month INTEGER NOT NULL CHECK (start_month BETWEEN 0 AND 11),
    end_month   INTEGER NOT NULL CHECK (end_month BETWEEN 0 AND 11),
    start_year  INTEGER NOT NULL DEFAULT 2026,
    end_year    INTEGER NOT NULL DEFAULT 2026,
    allocation  INTEGER NOT NULL CHECK (allocation BETWEEN 1 AND 100),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_assignment_link CHECK (
        (type = 'project' AND project_id IS NOT NULL AND bid_id IS NULL) OR
        (type = 'bid' AND bid_id IS NOT NULL AND project_id IS NULL) OR
        (project_id IS NULL AND bid_id IS NULL)
    )
);

CREATE INDEX idx_assignments_resource ON assignments(resource_id);
CREATE INDEX idx_assignments_project ON assignments(project_id);
CREATE INDEX idx_assignments_bid ON assignments(bid_id);

-- ============================================================
-- LEAVES
-- ============================================================
CREATE TABLE leaves (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    month       INTEGER NOT NULL CHECK (month BETWEEN 0 AND 11),
    year        INTEGER NOT NULL DEFAULT 2026,
    days        INTEGER NOT NULL CHECK (days BETWEEN 1 AND 22),
    reason      VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(resource_id, month, year)
);

CREATE INDEX idx_leaves_resource ON leaves(resource_id);

-- ============================================================
-- PORTAL CONFIGURATION
-- ============================================================
CREATE TABLE portal_config (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    owner        VARCHAR(150),
    passphrase   VARCHAR(255),
    access_level portal_access_level DEFAULT 'read_only',
    version      INTEGER DEFAULT 1,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GENERIC AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID NOT NULL,
    action      VARCHAR(20) NOT NULL,
    old_value   JSONB,
    new_value   JSONB,
    changed_by  VARCHAR(150),
    changed_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_time ON audit_log(changed_at);

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Resource utilization per month
CREATE OR REPLACE VIEW v_resource_utilization AS
SELECT
    r.id AS resource_id,
    r.name AS resource_name,
    r.role,
    m.month_index,
    r.monthly_capacity AS base_capacity,
    COALESCE(l.days, 0) AS leave_days,
    GREATEST(0, r.monthly_capacity - COALESCE(l.days, 0)) AS effective_capacity,
    COALESCE(alloc.total_allocation, 0) AS total_allocation,
    CASE
        WHEN (r.monthly_capacity - COALESCE(l.days, 0)) = 0 THEN 0
        ELSE LEAST(ROUND(COALESCE(alloc.total_allocation, 0)::NUMERIC), 100)
    END AS utilization_pct
FROM resources r
CROSS JOIN generate_series(0, 11) AS m(month_index)
LEFT JOIN leaves l
    ON l.resource_id = r.id AND l.month = m.month_index AND l.year = 2026
LEFT JOIN (
    SELECT a.resource_id, gs.month_idx, SUM(a.allocation) AS total_allocation
    FROM assignments a,
         generate_series(a.start_month, a.end_month) AS gs(month_idx)
    GROUP BY a.resource_id, gs.month_idx
) alloc ON alloc.resource_id = r.id AND alloc.month_idx = m.month_index
WHERE r.is_archived = FALSE;

-- Bid pipeline summary
CREATE OR REPLACE VIEW v_bid_pipeline AS
SELECT
    status,
    COUNT(*) AS bid_count,
    COALESCE(SUM(estimated_value), 0) AS total_value,
    COALESCE(SUM(estimated_value * probability / 100.0), 0) AS weighted_value
FROM bids
WHERE is_archived = FALSE
GROUP BY status;

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO tags (name) VALUES
    ('React'), ('Angular'), ('Java'), ('Python'), ('UX'), ('PM'),
    ('DevOps'), ('SQL'), ('AWS'), ('TypeScript'), ('Spring Boot'), ('Node.js');

INSERT INTO resources (id, name, role, email) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Sarah Chen',     'Senior Developer',  'sarah.chen@company.com'),
    ('a1000000-0000-0000-0000-000000000002', 'Marcus Johnson',  'UX Designer',       'marcus.j@company.com'),
    ('a1000000-0000-0000-0000-000000000003', 'Aisha Patel',     'Business Analyst',  'aisha.p@company.com');

INSERT INTO projects (id, name, status, start_month, end_month, budget, client, description) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Project Alpha', 'active', 0, 4, 500000, 'Acme Corp',      'Enterprise platform development'),
    ('b1000000-0000-0000-0000-000000000002', 'Project Beta',  'active', 0, 7, 300000, 'TechStart Inc',  'UX redesign initiative'),
    ('b1000000-0000-0000-0000-000000000003', 'Project Gamma', 'active', 2, 5, 200000, 'FinServ Ltd',    'Analytics dashboard build');

INSERT INTO bids (id, name, status, start_month, end_month, estimated_value, client, probability, description) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Bid - Healthcare RFP', 'pending',   1, 2, 750000, 'MedCare Systems', 60, 'Healthcare portal proposal'),
    ('c1000000-0000-0000-0000-000000000002', 'Bid - Finance Portal', 'submitted', 0, 1, 400000, 'BankPro',         40, 'Client finance portal bid');

INSERT INTO assignments (resource_id, project_id, name, type, start_month, end_month, allocation) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Project Alpha', 'project', 0, 4, 60),
    ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Project Beta',  'project', 0, 7, 80),
    ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Project Gamma', 'project', 2, 5, 70);

INSERT INTO assignments (resource_id, bid_id, name, type, start_month, end_month, allocation) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Bid - Healthcare RFP', 'bid', 1, 2, 30),
    ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Bid - Finance Portal', 'bid', 0, 1, 50);

INSERT INTO leaves (resource_id, month, days, reason) VALUES
    ('a1000000-0000-0000-0000-000000000001', 2,  5,  'Vacation'),
    ('a1000000-0000-0000-0000-000000000001', 6,  10, 'Summer Leave'),
    ('a1000000-0000-0000-0000-000000000002', 3,  3,  'Personal'),
    ('a1000000-0000-0000-0000-000000000002', 11, 8,  'Holiday'),
    ('a1000000-0000-0000-0000-000000000003', 7,  15, 'Maternity'),
    ('a1000000-0000-0000-0000-000000000003', 8,  22, 'Maternity');
