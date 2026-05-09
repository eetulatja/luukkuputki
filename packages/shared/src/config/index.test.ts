import { describe, expect, it } from "vitest";
import { getConfig } from "./index";

const validEnv = {
	KAFKA_BROKER: "localhost:9092",
	DATABASE_URL: "postgresql://localhost/test",
	KAFKA_GROUP_PREFIX: "test",
};

describe("getConfig", () => {
	it("returns typed config when all vars are set", () => {
		const config = getConfig(validEnv);
		expect(config.kafkaBroker).toBe("localhost:9092");
		expect(config.databaseUrl).toBe("postgresql://localhost/test");
		expect(config.kafkaGroupPrefix).toBe("test");
	});

	it("throws and names KAFKA_BROKER when it is missing", () => {
		const { KAFKA_BROKER: _, ...env } = validEnv;
		expect(() => getConfig(env)).toThrow(/KAFKA_BROKER/);
	});

	it("throws and names DATABASE_URL when it is missing", () => {
		const { DATABASE_URL: _, ...env } = validEnv;
		expect(() => getConfig(env)).toThrow(/DATABASE_URL/);
	});

	it("throws and names KAFKA_GROUP_PREFIX when it is missing", () => {
		const { KAFKA_GROUP_PREFIX: _, ...env } = validEnv;
		expect(() => getConfig(env)).toThrow(/KAFKA_GROUP_PREFIX/);
	});

	it("throws when an empty string is provided", () => {
		expect(() => getConfig({ ...validEnv, KAFKA_BROKER: "" })).toThrow();
	});
});
