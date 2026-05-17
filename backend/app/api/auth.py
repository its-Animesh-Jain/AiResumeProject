from fastapi import APIRouter, Depends, HTTPException, status
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, Token, UserBase
from app.services.auth_service import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate):
    db_user = await User.find_one(User.email == user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        full_name=user_in.full_name
    )
    await user.insert()
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    user = await User.find_one(User.email == user_in.email)
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}
