from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactRequest(BaseModel):
	model_config = ConfigDict(str_strip_whitespace=True)

	name: str = Field(min_length=2, max_length=80)
	email: EmailStr
	subject: str = Field(min_length=3, max_length=140)
	message: str = Field(min_length=10, max_length=4000)
	honeypot: str = Field(default="", max_length=0)
