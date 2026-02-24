from pydantic import BaseModel, EmailStr


class MessageCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    body: str


class MessageRead(MessageCreate):
    id: int

    class Config:
        from_attributes = True
