from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from server.business.client.schema import PClient, PCreateClient
from server.data.models.client import Client


def create_client(session: Session, data: PCreateClient, user_id: str) -> PClient:
    client = Client(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        assigned_user_id=user_id,
    )
    session.add(client)
    
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="The email may already be in use.")
        
    session.refresh(client)
    return PClient.model_validate(client)