import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """Tracks active WebSocket connections, rooms, and online presence."""

    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}
        self.user_sessions: dict[int, dict[str, Any]] = {}
        self.rooms: dict[str, set[int]] = {}

    async def connect(self, websocket: WebSocket, user_id: int, user_info: dict[str, Any]):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_sessions[user_id] = user_info

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)
        self.user_sessions.pop(user_id, None)
        for room_id, members in list(self.rooms.items()):
            members.discard(user_id)
            if not members:
                del self.rooms[room_id]

    def join_room(self, room_id: str, user_id: int):
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(user_id)

    def leave_room(self, room_id: str, user_id: int):
        if room_id in self.rooms:
            self.rooms[room_id].discard(user_id)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active_connections

    def get_online_users(self) -> list[int]:
        return list(self.active_connections.keys())

    async def send_personal(self, user_id: int, message: dict[str, Any]):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict[str, Any], exclude: int | None = None):
        for user_id, websocket in list(self.active_connections.items()):
            if exclude is not None and user_id == exclude:
                continue
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                self.disconnect(user_id)

    async def broadcast_to_room(
        self, room_id: str, message: dict[str, Any], exclude: int | None = None
    ):
        members = self.rooms.get(room_id, set())
        for user_id in members:
            if exclude is not None and user_id == exclude:
                continue
            await self.send_personal(user_id, message)

    def get_room_members(self, room_id: str) -> list[int]:
        return list(self.rooms.get(room_id, set()))
