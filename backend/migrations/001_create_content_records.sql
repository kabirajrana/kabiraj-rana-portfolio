-- Durable admin content envelope. The payload column is JSONB because the
-- existing public API exposes several intentionally different content shapes.
CREATE TABLE IF NOT EXISTS content_records (
    key VARCHAR(255) PRIMARY KEY,
    resource VARCHAR(64) NOT NULL,
    record_id VARCHAR(128) NOT NULL,
    slug VARCHAR(255),
    status VARCHAR(64),
    record_type VARCHAR(64),
    sort_order INTEGER NOT NULL DEFAULT 0,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_content_records_resource_record UNIQUE (resource, record_id)
);

CREATE INDEX IF NOT EXISTS ix_content_records_resource ON content_records(resource);
CREATE INDEX IF NOT EXISTS ix_content_records_slug ON content_records(slug);
CREATE INDEX IF NOT EXISTS ix_content_records_status ON content_records(status);
CREATE INDEX IF NOT EXISTS ix_content_records_record_type ON content_records(record_type);
CREATE INDEX IF NOT EXISTS ix_content_records_sort_order ON content_records(sort_order);
