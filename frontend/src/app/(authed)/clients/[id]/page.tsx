"use client";

import {
    Avatar,
    Badge,
    Button,
    Divider,
    Grid,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { IconArrowLeft, IconMail, IconSend, IconUser } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useApi } from "@/api/context";
import { Client } from "@/types/clients";
import { Note } from "@/types/notes";

import styles from "./page.module.scss";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInitials(email: string) {
    return email.slice(0, 2).toUpperCase();
}

export default function ClientDetailPage() {
    const api = useApi();
    const router = useRouter();
    const params = useParams();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [noteBody, setNoteBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        Promise.all([
            api.clients.getClient(clientId),
            api.clients.listNotes(clientId),
        ])
            .then(([clientData, notesData]) => {
                setClient(clientData);
                setNotes(notesData);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [api, clientId]);

    const handleSubmitNote = async () => {
        if (!noteBody.trim()) return;
        setSubmitting(true);
        try {
            const newNote = await api.clients.createNote(clientId, noteBody.trim());
            setNotes(prev => [newNote, ...prev]);
            setNoteBody("");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmitNote();
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Loader variant="bars" size="lg" />
            </div>
        );
    }

    if (notFound || !client) {
        return (
            <div className={styles.container}>
                <Text c="dimmed">Client not found.</Text>
                <Button mt="md" variant="subtle" onClick={() => router.push("/clients")}>
                    Back to Clients
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Group mb="lg">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.push("/clients")}
                    px={0}
                >
                    Clients
                </Button>
            </Group>

            <Group mb="xl" align="flex-start" justify="space-between">
                <div>
                    <Title order={2}>
                        {client.first_name} {client.last_name}
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                        Client since {formatDate(client.created_at)}
                    </Text>
                </div>
                <Badge
                    size="lg"
                    variant="light"
                    color={client.assigned_user_id ? "violet" : "gray"}
                >
                    {client.assigned_user_id ? "Assigned" : "Unassigned"}
                </Badge>
            </Group>

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder p="lg" radius="md" className={styles.card}>
                        <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">
                            Contact Information
                        </Text>
                        <Stack gap="sm">
                            <Group gap="sm">
                                <IconMail size={16} color="gray" />
                                <Text size="sm">{client.email}</Text>
                            </Group>
                            <Group gap="sm">
                                <IconUser size={16} color="gray" />
                                <Text size="sm">
                                    {client.assigned_user_id
                                        ? `Advisor ID: ${client.assigned_user_id}`
                                        : "No advisor assigned"}
                                </Text>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder p="lg" radius="md" className={styles.card}>
                        <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">
                            Account Details
                        </Text>
                        <Stack gap="sm">
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Client ID</Text>
                                <Text size="sm" ff="monospace">{client.id}</Text>
                            </Group>
                            <Divider />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Created</Text>
                                <Text size="sm">{formatDate(client.created_at)}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Last Updated</Text>
                                <Text size="sm">{formatDate(client.updated_at)}</Text>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Paper withBorder p="lg" radius="md">
                        <Text fw={600} size="sm" c="dimmed" mb="md" tt="uppercase">
                            Notes
                        </Text>

                        <Stack gap="xs" mb="lg">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Add a note — Cmd+Enter to submit"
                                value={noteBody}
                                onChange={e => setNoteBody(e.currentTarget.value)}
                                onKeyDown={handleKeyDown}
                                autosize
                                minRows={3}
                                maxRows={8}
                            />
                            <Group justify="flex-end">
                                <Button
                                    leftSection={<IconSend size={14} />}
                                    onClick={handleSubmitNote}
                                    loading={submitting}
                                    disabled={!noteBody.trim()}
                                    size="sm"
                                >
                                    Add Note
                                </Button>
                            </Group>
                        </Stack>

                        {notes.length === 0 ? (
                            <Text c="dimmed" size="sm" ta="center" py="xl">
                                No notes yet. Add one above.
                            </Text>
                        ) : (
                            <Stack gap="md">
                                {notes.map((note, index) => (
                                    <div key={note.id}>
                                        {index > 0 && <Divider mb="md" />}
                                        <Group align="flex-start" gap="sm">
                                            <Avatar size="sm" radius="xl" color="violet">
                                                {getInitials(note.user_email)}
                                            </Avatar>
                                            <div className={styles.noteContent}>
                                                <Group gap="xs" mb={4}>
                                                    <Text size="sm" fw={500}>
                                                        {note.user_email}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {formatDateTime(note.created_at)}
                                                    </Text>
                                                </Group>
                                                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                                    {note.body}
                                                </Text>
                                            </div>
                                        </Group>
                                    </div>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
}