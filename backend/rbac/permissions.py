from enum import Enum

from rbac.roles import Role


class Permission(str, Enum):
    MANAGE_USERS = "manage_users"
    VIEW_ALL_TICKETS = "view_all_tickets"
    VIEW_ASSIGNED_TICKETS = "view_assigned_tickets"
    VIEW_OWN_TICKETS = "view_own_tickets"
    VIEW_ANALYTICS = "view_analytics"
    MANAGE_AGENTS = "manage_agents"
    SYSTEM_CONFIG = "system_config"
    RESPOND_TICKETS = "respond_tickets"
    UPDATE_TICKET = "update_ticket"
    ASSIGN_TICKETS = "assign_tickets"
    VIEW_CUSTOMER_HISTORY = "view_customer_history"
    AI_CHAT = "ai_chat"


ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.ADMIN: {
        Permission.MANAGE_USERS,
        Permission.VIEW_ALL_TICKETS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_AGENTS,
        Permission.SYSTEM_CONFIG,
        Permission.RESPOND_TICKETS,
        Permission.UPDATE_TICKET,
        Permission.ASSIGN_TICKETS,
        Permission.VIEW_CUSTOMER_HISTORY,
        Permission.AI_CHAT,
    },
    Role.SUPPORT_AGENT: {
        Permission.VIEW_ASSIGNED_TICKETS,
        Permission.RESPOND_TICKETS,
        Permission.UPDATE_TICKET,
        Permission.VIEW_CUSTOMER_HISTORY,
        Permission.AI_CHAT,
    },
    Role.USER: {
        Permission.VIEW_OWN_TICKETS,
        Permission.AI_CHAT,
    },
}


def get_role_permissions(role: str) -> set[Permission]:
    try:
        return ROLE_PERMISSIONS[Role(role)]
    except ValueError:
        return ROLE_PERMISSIONS[Role.USER]


def has_permission(role: str, permission: Permission) -> bool:
    return permission in get_role_permissions(role)
