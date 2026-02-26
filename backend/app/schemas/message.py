from pydantic import BaseModel, EmailStr, Field


class MessageCreate(BaseModel):
    email: EmailStr
    name: str | None = Field(default=None, max_length=120)
    subject: str | None = Field(default=None, max_length=180)
    body: str = Field(min_length=10, max_length=4000)


class MessageRead(MessageCreate):
    id: int

    class Config:
        from_attributes = True
