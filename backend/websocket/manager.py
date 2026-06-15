import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.chat_message import ChatMessage
from rbac.roles import Role
from services.chat_service import process_chat_message
from websocket.connection_manager import ConnectionManager

connection_manager = ConnectionManager()


def room_id_for_user(user_id: int) -> str:
    return f"chat_{user_id}"


async def notify_presence(room_id: str, user_id: int, online: bool, user_info: dict):
    await connection_manager.broadcast_to_room(
        room_id,
        {
            "type": "presence",
            "user_id": user_id,
            "name": user_info.get("name"),
            "role": user_info.get("role"),
            "online": online,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def broadcast_online_users(room_id: str):
    online = []
    for uid in connection_manager.get_room_members(room_id):
        session = connection_manager.user_sessions.get(uid)
        if session:
            online.append(
                {
                    "user_id": uid,
                    "name": session.get("name"),
                    "role": session.get("role"),
                    "online": True,
                }
            )
    await connection_manager.broadcast_to_room(
        room_id,
        {"type": "online_users", "users": online, "timestamp": datetime.now(timezone.utc).isoformat()},
    )


async def handle_typing(room_id: str, user_id: int, is_typing: bool, user_info: dict):
    await connection_manager.broadcast_to_room(
        room_id,
        {
            "type": "typing",
            "user_id": user_id,
            "name": user_info.get("name"),
            "role": user_info.get("role"),
            "is_typing": is_typing,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        exclude=user_id,
    )


async def save_and_broadcast_message(
    db: Session,
    room_user_id: int,
    sender_id: int,
    sender_role: str,
    content: str,
    message_type: str = "text",
    exclude_sender: bool = False,
):
    msg = ChatMessage(
        room_user_id=room_user_id,
        sender_id=sender_id,
        sender_role=sender_role,
        content=content,
        message_type=message_type,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    payload = {
        "type": "message",
        "id": msg.id,
        "room_user_id": room_user_id,
        "sender_id": sender_id,
        "sender_role": sender_role,
        "content": content,
        "message_type": message_type,
        "created_at": msg.created_at.isoformat() if msg.created_at else datetime.now(timezone.utc).isoformat(),
    }

    room_id = room_id_for_user(room_user_id)
    await connection_manager.broadcast_to_room(
        room_id,
        payload,
        exclude=sender_id if exclude_sender else None,
    )
    return msg


async def handle_chat_message(
    db: Session,
    room_user_id: int,
    sender_id: int,
    sender_role: str,
    content: str,
    sender_info: dict,
):
    room_id = room_id_for_user(room_user_id)

    if sender_role == Role.USER.value and sender_id == room_user_id:
        user_payload = {
            "type": "message",
            "room_user_id": room_user_id,
            "sender_id": sender_id,
            "sender_role": sender_role,
            "content": content,
            "message_type": "text",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await connection_manager.broadcast_to_room(room_id, user_payload)

        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": "typing",
                "user_id": 0,
                "name": "SupportLens AI",
                "role": "ai",
                "is_typing": True,
            },
        )

        interaction = process_chat_message(db, room_user_id, content)

        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": "typing",
                "user_id": 0,
                "name": "SupportLens AI",
                "role": "ai",
                "is_typing": False,
            },
        )

        ai_payload = {
            "type": "message",
            "id": interaction.id,
            "room_user_id": room_user_id,
            "sender_id": 0,
            "sender_role": "ai",
            "content": interaction.answer,
            "message_type": "ai",
            "sentiment": interaction.sentiment,
            "ticket_id": interaction.ticket_id,
            "created_at": interaction.created_at.isoformat() if interaction.created_at else datetime.now(timezone.utc).isoformat(),
        }
        await connection_manager.broadcast_to_room(room_id, ai_payload)
        return

    if sender_role in (Role.SUPPORT_AGENT.value, Role.ADMIN.value):
        await save_and_broadcast_message(
            db,
            room_user_id,
            sender_id,
            sender_role,
            content,
            message_type="agent",
        )


async def handle_incoming(websocket, db: Session, room_user_id: int, user_id: int, user_info: dict):
    room_id = room_id_for_user(room_user_id)
    connection_manager.join_room(room_id, user_id)

    await notify_presence(room_id, user_id, True, user_info)
    await broadcast_online_users(room_id)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "ping":
                await connection_manager.send_personal(user_id, {"type": "pong"})
            elif msg_type == "typing":
                await handle_typing(room_id, user_id, data.get("is_typing", False), user_info)
            elif msg_type == "message":
                content = (data.get("content") or "").strip()
                if content:
                    await handle_chat_message(
                        db,
                        room_user_id,
                        user_id,
                        user_info.get("role", Role.USER.value),
                        content,
                        user_info,
                    )
            elif msg_type == "private_message":
                target_id = data.get("target_user_id")
                content = (data.get("content") or "").strip()
                if target_id and content:
                    private_payload = {
                        "type": "private_message",
                        "from_user_id": user_id,
                        "from_name": user_info.get("name"),
                        "from_role": user_info.get("role"),
                        "content": content,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                    await connection_manager.send_personal(target_id, private_payload)
                    await connection_manager.send_personal(
                        user_id,
                        {**private_payload, "type": "private_message_sent", "to_user_id": target_id},
                    )
    finally:
        connection_manager.leave_room(room_id, user_id)
        connection_manager.disconnect(user_id)
        await notify_presence(room_id, user_id, False, user_info)
        await broadcast_online_users(room_id)
