from pydantic import BaseModel, EmailStr

class SignUp(BaseModel):
    email:str
    password:str
    job_title:str

class Login(BaseModel):
    email:str
    password:str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    