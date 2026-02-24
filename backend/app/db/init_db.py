from app.db.database import engine
from app.models import message, post, project, user


def init_db() -> None:
    project.Base.metadata.create_all(bind=engine)
    post.Base.metadata.create_all(bind=engine)
    message.Base.metadata.create_all(bind=engine)
    user.Base.metadata.create_all(bind=engine)
