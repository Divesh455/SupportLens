from fastapi import Depends, HTTPException, status

from models.user import User
from rbac.permissions import Permission, has_permission
from rbac.roles import Role
from routes.auth_routes import get_current_user


def require_permission(permission: Permission):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value}",
            )
        return current_user

    return dependency


def require_roles(*roles: Role):
    allowed = {role.value for role in roles}

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized for this action",
            )
        return current_user

    return dependency


def require_any_permission(*permissions: Permission):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not any(has_permission(current_user.role, p) for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized for this action",
            )
        return current_user

    return dependency
