-- Add missing updated_at to project_milestones
ALTER TABLE project_milestones
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing timestamps to tags
ALTER TABLE tags
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
