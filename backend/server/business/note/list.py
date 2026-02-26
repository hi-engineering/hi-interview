from sqlalchemy import select
from sqlalchemy.orm import Session

from server.business.note.schema import PNote
from server.data.models.note import Note


def list_notes(session: Session, client_id: str) -> list[PNote]:
    notes = (
        session.execute(
            select(Note)
            .where(Note.client_id == client_id)
            .order_by(Note.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [
        PNote(
            id=note.id,
            client_id=note.client_id,
            user_id=note.user_id,
            user_email=note.user.email,
            body=note.body,
            created_at=note.created_at,
        )
        for note in notes
    ]