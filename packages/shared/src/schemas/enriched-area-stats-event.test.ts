import { describe, expect, it } from "vitest";
import { EnrichedAreaStatsEventSchema } from "./enriched-area-stats-event";

const validEnrichedEvent = {
	postal_code: "00180",
	quarter: "2024Q1",
	building_type: "kerrostalo",
	avg_price_per_sqm: 6250.5,
	sale_count: 12,
	area_label: "Kamppi / Ruoholahti / Jätkäsaari (00180)",
	district: "Eteläinen Helsinki",
	deviation_from_pks_avg: 4.2,
	ingestion_timestamp: "2024-06-15T12:00:00.000Z",
};

describe("EnrichedAreaStatsEventSchema", () => {
	it("accepts a valid enriched event", () => {
		expect(EnrichedAreaStatsEventSchema.safeParse(validEnrichedEvent).success).toBe(true);
	});

	it("accepts deviation_from_pks_avg as null", () => {
		const event = { ...validEnrichedEvent, deviation_from_pks_avg: null };
		expect(EnrichedAreaStatsEventSchema.safeParse(event).success).toBe(true);
	});

	it("rejects a raw event missing enriched fields", () => {
		const raw = {
			postal_code: "00180",
			quarter: "2024Q1",
			building_type: "kerrostalo",
			avg_price_per_sqm: 6250.5,
			sale_count: 12,
		};
		expect(EnrichedAreaStatsEventSchema.safeParse(raw).success).toBe(false);
	});

	it("rejects missing area_label", () => {
		const { area_label: _, ...withoutAreaLabel } = validEnrichedEvent;
		expect(EnrichedAreaStatsEventSchema.safeParse(withoutAreaLabel).success).toBe(false);
	});

	it("rejects missing ingestion_timestamp", () => {
		const { ingestion_timestamp: _, ...withoutTimestamp } = validEnrichedEvent;
		expect(EnrichedAreaStatsEventSchema.safeParse(withoutTimestamp).success).toBe(false);
	});
});
