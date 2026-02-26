import { AxiosInstance } from "axios";

import { Client } from "@/types/clients";
import { Note } from "@/types/notes";

export default class ClientsApi {
    private axiosInstance: AxiosInstance;

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance;
    }

    public listClients = async (): Promise<Client[]> => {
        const response = await this.axiosInstance.get<{ data: Client[] }>("client");
        return response.data.data;
    };

    public getClient = async (clientId: string): Promise<Client> => {
        const response = await this.axiosInstance.get<Client>(`client/${clientId}`);
        return response.data;
    };

    public listNotes = async (clientId: string): Promise<Note[]> => {
        const response = await this.axiosInstance.get<{ data: Note[] }>(
            `client/${clientId}/note`
        );
        return response.data.data;
    };

    public createNote = async (clientId: string, body: string): Promise<Note> => {
        const response = await this.axiosInstance.post<Note>(
            `client/${clientId}/note`,
            { body }
        );
        return response.data;
    };
}