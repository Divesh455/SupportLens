from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status

from database.db import SessionLocal
from rbac.roles import Role
from utils.security import decode_access_token
from services.auth_service import get_user_by_id
from websocket.manager import connection_manager, handle_incoming, room_id_for_user

router = APIRouter(tags=["websocket"])


def authenticate_websocket(token: str | None, path_user_id: int):
    if not token:
        return None, "Missing authentication token"

    payload = decode_access_token(token)
    if not payload:
        return None, "Invalid or expired token"

    user_id = payload.get("id")
    role = payload.get("role", Role.USER.value)
    if user_id is None:
        return None, "Invalid token payload"

    user_id = int(user_id)

    if role == Role.ADMIN.value or role == Role.SUPPORT_AGENT.value:
        return {"id": user_id, "role": role, "name": payload.get("name", "Agent")}, None

    if user_id != path_user_id:
        return None, "Not authorized to access this chat room"

    return {"id": user_id, "role": role, "name": payload.get("name", "User")}, None


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: int,
    token: str = Query(default=None),
):
    db = SessionLocal()
    connected_user_id = None
    try:
        user_info, error = authenticate_websocket(token, user_id)
        if error:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        db_user = get_user_by_id(db, user_info["id"])
        if db_user:
            user_info["name"] = db_user.name
            user_info["role"] = db_user.role

        connected_user_id = user_info["id"]
        await connection_manager.connect(websocket, connected_user_id, user_info)

        await connection_manager.send_personal(
            connected_user_id,
            {
                "type": "connected",
                "user_id": connected_user_id,
                "room_user_id": user_id,
                "role": user_info["role"],
            },
        )

        await handle_incoming(websocket, db, user_id, connected_user_id, user_info)
    except WebSocketDisconnect:
        pass
    finally:
        if connected_user_id is not None:
            connection_manager.disconnect(connected_user_id)
        db.close()
