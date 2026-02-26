"use client";

import { Button, Group, Modal, Stack, Table, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus } from "@tabler/icons-react";
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
    const [opened, { open, close }] = useDisclosure(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.clients.listClients()
            .then(setClients)
            .finally(() => setLoading(false));
    }, [api]);

    const handleOpen = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setError(null);
        open();
    };

    const handleCreate = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("All fields are required.");
            return;
        }
        setCreating(true);
        setError(null);
        try {
            const newClient = await api.clients.createClient({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
            });
            setClients(prev => [newClient, ...prev]);
            close();
        } catch {
            setError("Failed to create client. The email may already be in use.");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <Group justify="space-between" className={styles.header}>
                <Title order={2}>Clients</Title>
                <Button
                    leftSection={<IconUserPlus size={16} />}
                    onClick={handleOpen}
                >
                    New Client
                </Button>
            </Group>

            <Table striped highlightOnHover withTableBorder withColumnBorders>
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

            <Modal opened={opened} onClose={close} title="New Client" centered>
                <Stack gap="sm">
                    <Group grow>
                        <TextInput
                            label="First Name"
                            placeholder="Jane"
                            value={firstName}
                            onChange={e => setFirstName(e.currentTarget.value)}
                            required
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Smith"
                            value={lastName}
                            onChange={e => setLastName(e.currentTarget.value)}
                            required
                        />
                    </Group>
                    <TextInput
                        label="Email"
                        placeholder="jane@example.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.currentTarget.value)}
                        required
                    />
                    {error && (
                        <p className={styles.error}>{error}</p>
                    )}
                    <Group justify="flex-end" mt="xs">
                        <Button variant="subtle" onClick={close}>Cancel</Button>
                        <Button onClick={handleCreate} loading={creating}>
                            Create Client
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}