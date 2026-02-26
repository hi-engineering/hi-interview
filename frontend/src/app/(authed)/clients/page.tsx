"use client";

import { Table, Title, Button, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useApi } from "@/api/context";
import { Client } from "@/types/clients";

import styles from "./page.module.scss";

export default function ClientsPage() {
    const api = useApi();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.clients.listClients()
            .then(setClients)
            .finally(() => setLoading(false));
    }, [api]);

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <Group justify="space-between" className={styles.header}>
                <Title order={2}>Clients</Title>
            </Group>
            <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Assigned</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {clients.map(client => (
                        <Table.Tr
                            key={client.id}
                            className={styles.row}
                            onClick={() => router.push(`/clients/${client.id}`)}
                        >
                            <Table.Td>{client.first_name} {client.last_name}</Table.Td>
                            <Table.Td>{client.email}</Table.Td>
                            <Table.Td>{client.assigned_user_id ? "Yes" : "No"}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </div>
    );
}