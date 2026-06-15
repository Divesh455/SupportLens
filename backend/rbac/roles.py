from enum import Enum


class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPPORT_AGENT = "support_agent"


ROLE_LABELS = {
    Role.USER: "Customer",
    Role.ADMIN: "Admin",
    Role.SUPPORT_AGENT: "Support Agent",
}
