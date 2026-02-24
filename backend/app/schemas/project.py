from pydantic import BaseModel


class ProjectBase(BaseModel):
    slug: str
    title: str
    description: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int

    class Config:
        from_attributes = True
