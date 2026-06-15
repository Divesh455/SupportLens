from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.user import User
from rbac.permissions import Permission, has_permission
from rbac.roles import Role
from rbac.dependencies import require_permission
from schemas.admin_schema import AgentCreate, SystemConfig, UserUpdate
from schemas.user_schema import UserResponse
from services.auth_service import (
    create_user,
    delete_user,
    get_agents,
    get_all_users,
    get_user_by_id,
    update_user,
)

router = APIRouter(prefix="/admin", tags=["admin"])

_system_config = SystemConfig()


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
):
    return get_all_users(db)


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_role(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
):
    if user_id == current_user.id and data.role and data.role != current_user.role:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    if data.role and data.role not in {r.value for r in Role}:
        raise HTTPException(status_code=400, detail="Invalid role")

    updated = update_user(
        db,
        user_id,
        name=data.name,
        company=data.company,
        role=data.role,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.delete("/users/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@router.get("/agents", response_model=list[UserResponse])
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_AGENTS)),
):
    return get_agents(db)


@router.post("/agents", response_model=UserResponse)
def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.MANAGE_AGENTS)),
):
    from services.auth_service import get_user_by_email

    if get_user_by_email(db, agent.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, agent, role=Role.SUPPORT_AGENT.value)


@router.get("/config", response_model=SystemConfig)
def get_system_config(
    current_user: User = Depends(require_permission(Permission.SYSTEM_CONFIG)),
):
    return _system_config


@router.put("/config", response_model=SystemConfig)
def update_system_config(
    config: SystemConfig,
    current_user: User = Depends(require_permission(Permission.SYSTEM_CONFIG)),
):
    global _system_config
    _system_config = config
    return _system_config
