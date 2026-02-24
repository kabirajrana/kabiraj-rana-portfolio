from pydantic import BaseModel


class PostBase(BaseModel):
    slug: str
    title: str
    content: str | None = None


class PostCreate(PostBase):
    pass


class PostRead(PostBase):
    id: int

    class Config:
        from_attributes = True
