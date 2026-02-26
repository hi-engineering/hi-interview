from fastapi import APIRouter, HTTPException

from server.business.auth.auth_verifier import AuthVerifier
from server.business.auth.schema import UserTokenInfo
from server.business.client.create import create_client
from server.business.client.get import get_client
from server.business.client.list import list_clients
from server.business.client.schema import PClient, PCreateClient
from server.business.note.create import create_note
from server.business.note.list import list_notes
from server.business.note.schema import PCreateNote, PNote
from server.shared.databasemanager import DatabaseManager
from server.shared.pydantic import PList


def get_router(database: DatabaseManager, auth_verifier: AuthVerifier) -> APIRouter:
    router = APIRouter()

    @router.get("/client")
    async def list_clients_route(
        _: UserTokenInfo = auth_verifier.UserTokenInfo(),
    ) -> PList[PClient]:
        with database.create_session() as session:
            clients = list_clients(session)
            return PList(data=clients)

    @router.post("/client", status_code=201)
    async def create_client_route(
        body: PCreateClient,
        user_token: UserTokenInfo = auth_verifier.UserTokenInfo(),
    ) -> PClient:
        with database.create_session() as session:
            client = create_client(session, body, user_token.user_id)
            session.commit()
            return client

    @router.get("/client/{client_id}")
    async def get_client_route(
        client_id: str,
        _: UserTokenInfo = auth_verifier.UserTokenInfo(),
    ) -> PClient:
        with database.create_session() as session:
            client = get_client(session, client_id)
            if client is None:
                raise HTTPException(status_code=404, detail="Client not found")
            return client

    @router.get("/client/{client_id}/note")
    async def list_notes_route(
        client_id: str,
        _: UserTokenInfo = auth_verifier.UserTokenInfo(),
    ) -> PList[PNote]:
        with database.create_session() as session:
            notes = list_notes(session, client_id)
            return PList(data=notes)

    @router.post("/client/{client_id}/note", status_code=201)
    async def create_note_route(
        client_id: str,
        body: PCreateNote,
        user_token: UserTokenInfo = auth_verifier.UserTokenInfo(),
    ) -> PNote:
        with database.create_session() as session:
            client = get_client(session, client_id)
            if client is None:
                raise HTTPException(status_code=404, detail="Client not found")
            note = create_note(session, client_id, user_token.user_id, body)
            session.commit()
            return note

    return router