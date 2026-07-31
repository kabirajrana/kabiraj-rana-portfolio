# PostgreSQL migrations

Run `001_create_content_records.sql` once against the PostgreSQL database before
starting the new backend, or allow SQLAlchemy startup initialization to create
the same table in a controlled deployment environment.

After the table exists, run the one-time importer from the `backend` directory:

```bash
python -m scripts.import_admin_store --file .data/admin_store.json
```

The importer is idempotent and skips existing `(resource, record_id)` and
credential IDs. The running application never reads this JSON file.
