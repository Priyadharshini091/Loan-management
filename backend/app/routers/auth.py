from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from app.schemas.schemas import UserLogin, TokenResponse, UserResponse, UserCreate
from app.auth.jwt import verify_password, get_password_hash, create_access_token, get_current_user, require_admin
from app.excel.db import read_sheet, write_sheet, log_audit

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    users = read_sheet("Users")
    user = next((u for u in users if u.get("username") == credentials.username), None)
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if user.get("status") != "Active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    access_token = create_access_token(data={"sub": user["username"], "role": user.get("role", "Staff")})
    
    log_audit(user["user_id"], user["username"], "LOGIN", "AUTH", user["user_id"], "User logged in")

    user_resp = UserResponse(
        user_id=user["user_id"],
        username=user["username"],
        email=user.get("email", ""),
        role=user.get("role", "Staff"),
        status=user.get("status", "Active"),
        created_at=user.get("created_at", "")
    )

    return TokenResponse(access_token=access_token, user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user["user_id"],
        username=current_user["username"],
        email=current_user.get("email", ""),
        role=current_user.get("role", "Staff"),
        status=current_user.get("status", "Active"),
        created_at=current_user.get("created_at", "")
    )

@router.get("/users", response_model=list[UserResponse])
def get_users(current_user: dict = Depends(get_current_user)):
    users = read_sheet("Users")
    return [
        UserResponse(
            user_id=u["user_id"],
            username=u["username"],
            email=u.get("email", ""),
            role=u.get("role", "Staff"),
            status=u.get("status", "Active"),
            created_at=u.get("created_at", "")
        )
        for u in users
    ]

@router.post("/users", response_model=UserResponse)
def create_user(user_in: UserCreate, current_user: dict = Depends(require_admin)):
    users = read_sheet("Users")
    if any(u.get("username") == user_in.username for u in users):
        raise HTTPException(status_code=400, detail="Username already exists")

    new_id = f"USR{len(users) + 1:04d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    hashed_pwd = get_password_hash(user_in.password)

    new_user = {
        "user_id": new_id,
        "username": user_in.username,
        "email": user_in.email,
        "password_hash": hashed_pwd,
        "role": user_in.role,
        "status": "Active",
        "created_at": now_str
    }
    users.append(new_user)
    write_sheet("Users", users)

    log_audit(current_user["user_id"], current_user["username"], "CREATE", "USERS", new_id, f"Created user {user_in.username}")

    return UserResponse(
        user_id=new_id,
        username=user_in.username,
        email=user_in.email,
        role=user_in.role,
        status="Active",
        created_at=now_str
    )
