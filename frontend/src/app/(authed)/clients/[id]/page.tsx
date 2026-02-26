"use client";

import {
    Badge,
    Button,
    Divider,
    Grid,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconArrowLeft, IconMail, IconUser } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useApi } from "@/api/context";
import { Client } from "@/types/clients";

import styles from "./page.module.scss";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function ClientDetailPage() {
    const api = useApi();
    const router = useRouter();
    const params = useParams();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        api.clients
            .getClient(clientId)
            .then(setClient)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [api, clientId]);

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
            </Grid>
        </div>
    );
}