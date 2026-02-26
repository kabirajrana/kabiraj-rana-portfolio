from sqlalchemy import inspect, text

from app.db.database import engine
from app.models import message, post, project, user


def init_db() -> None:
    project.Base.metadata.create_all(bind=engine)
    post.Base.metadata.create_all(bind=engine)
    message.Base.metadata.create_all(bind=engine)
    user.Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    if "messages" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("messages")}

    with engine.begin() as connection:
        if "subject" not in columns:
            connection.execute(text("ALTER TABLE messages ADD COLUMN subject VARCHAR(255)"))
        if "created_at" not in columns:
            connection.execute(text("ALTER TABLE messages ADD COLUMN created_at DATETIME"))
            connection.execute(text("UPDATE messages SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
