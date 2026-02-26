from sqlalchemy.orm import Session

from server.business.note.schema import PCreateNote, PNote
from server.data.models.note import Note


def create_note(
    session: Session, client_id: str, user_id: str, data: PCreateNote
) -> PNote:
    note = Note(
        client_id=client_id,
        user_id=user_id,
        body=data.body,
    )
    session.add(note)
    session.flush()
    session.refresh(note)

    return PNote(
        id=note.id,
        client_id=note.client_id,
        user_id=note.user_id,
        user_email=note.user.email,
        body=note.body,
        created_at=note.created_at,
    )