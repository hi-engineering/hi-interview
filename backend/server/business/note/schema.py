from datetime import datetime

from server.shared.pydantic import BaseModel


class PNote(BaseModel):
    id: str
    client_id: str
    user_id: str
    user_email: str
    body: str
    created_at: datetime


class PCreateNote(BaseModel):
    body: str