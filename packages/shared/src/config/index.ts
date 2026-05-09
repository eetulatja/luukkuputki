import { z } from "zod";

const ConfigSchema = z.object({
	KAFKA_BROKER: z.string().min(1),
	DATABASE_URL: z.string().min(1),
	KAFKA_GROUP_PREFIX: z.string().min(1),
});

export function getConfig(env: Record<string, string | undefined> = process.env) {
	const result = ConfigSchema.safeParse(env);
	if (!result.success) {
		const missing = result.error.issues.map((i) => i.path[0]).join(", ");
		throw new Error(`Missing required environment variables: ${missing}`);
	}
	return {
		kafkaBroker: result.data.KAFKA_BROKER,
		databaseUrl: result.data.DATABASE_URL,
		kafkaGroupPrefix: result.data.KAFKA_GROUP_PREFIX,
	};
}
