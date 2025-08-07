from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from models import SignUp, Login
import bcrypt
from uuid import uuid4
from passlib.context import CryptContext
from jose import JWTError, jwt
from wordGen import wordgenerator
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SECRET_KEY = "302ab89127f3a8836b8dedb242b7c42693de97041946600e8330bbbfc91e146b"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
cred = credentials.Certificate("firebaseKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    hashed_password =  pwd_context.hash(password)
    return hashed_password


def verify_password(user_entered_password, hashed_password)->bool:
    return pwd_context.verify(user_entered_password, hashed_password)



@app.get("/")
async def sayHello():
    return "welcome"
   

@app.post("/signup")
async def signup(user: SignUp):
    user_ref = db.collection("users")
    existing_user = user_ref.where("email", "==", user.email.strip().lower()).get()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid4())
    user_details = {
        "user_id":user_id,
        "email": user.email.strip().lower(),
        "password": hash_password(user.password),
        "job_title": user.job_title,
        "created_at": datetime.now()
        
    }
    try:
        user_ref.add(user_details)
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/login")
async def login_user(login: Login):
    user_ref = db.collection("users")
    user_exist = user_ref.where("email", "==", login.email.strip().lower()).get()
    
    print(user_exist)
    if not user_exist:
        raise HTTPException(status_code=400, detail="invalid credentials")
    
    user_doc = user_exist[0].to_dict()
    print(user_doc)  
    if not verify_password(login.password, user_doc["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    data={
        "sub": login.email,
        "user_id":user_doc["user_id"],
        "job_title":user_doc["job_title"]
        }
    access_token = create_access_token(data)
    return {"access_token": access_token, "token_type": "bearer"}

def create_access_token(data:dict):
    user_details_copy = data.copy()
    access_token = jwt.encode(user_details_copy,SECRET_KEY,ALGORITHM)
    return access_token


def get_current_user(token:str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id :str = payload.get("user_id")
        job_title: str = payload.get("job_title")
        if user_id is None:
            raise HTTPException(status_code=401, detail="invalid token")
        
        return{"user_id":user_id,"job_title":job_title}
    except JWTError:    
        raise HTTPException(status_code=401, detail="Token verification failed")    

       
@app.get("/generate-data")
async def generateData(current_user:dict = Depends(get_current_user)):
    
    user_ref = db.collection("words_generation_info")
    user_id = current_user["user_id"]
    job_title = current_user["job_title"]
    today = datetime.now()
    formatted_date = today.strftime("%d-%m-%Y")
    user_doc = user_ref.where("user_id", "==", user_id).where("words_generated_on", "==", formatted_date).get()
    ai_response = None
    if not user_doc:
        try:
            ai_response = wordgenerator(job_title)
            generation_details = {
                "user_id" : user_id,
                "word_object":ai_response,
                "words_generated_on":formatted_date
            }
            user_ref.add(generation_details)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating or saving data: {str(e)}")
    else:
        # If user_doc exists, get the word_object from the document
        user_records = user_doc[0].to_dict()
        ai_response = user_records["word_object"]
    return ai_response


@app.get("/get-data")
async def get_data(current_user:dict = Depends(get_current_user)):
    user_ref = db.collection("words_generation_info")
    user_id = current_user["user_id"]
    today = datetime.now()
    formatted_date = today.strftime("%d-%m-%Y")
    
    user_doc = user_ref.where("user_id", "==", user_id).where("words_generated_on", "==", formatted_date).get()
    if user_doc:
        user_records = user_doc[0].to_dict()
        print(user_records)
        return user_records["word_object"]