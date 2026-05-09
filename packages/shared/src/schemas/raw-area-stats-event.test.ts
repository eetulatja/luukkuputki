import { describe, expect, it } from "vitest";
import { RawAreaStatsEventSchema } from "./raw-area-stats-event";

const validEvent = {
	postal_code: "00180",
	quarter: "2024Q1",
	building_type: "kerrostalo",
	avg_price_per_sqm: 6250.5,
	sale_count: 12,
};

describe("RawAreaStatsEventSchema", () => {
	it("accepts a valid event", () => {
		expect(RawAreaStatsEventSchema.safeParse(validEvent).success).toBe(true);
	});

	it("accepts rivitalo building type", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, building_type: "rivitalo" }).success).toBe(true);
	});

	it("accepts zero sale_count", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, sale_count: 0 }).success).toBe(true);
	});

	it("rejects unknown building type", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, building_type: "omakotitalo" }).success).toBe(false);
	});

	it("rejects negative avg_price_per_sqm", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, avg_price_per_sqm: -1 }).success).toBe(false);
	});

	it("rejects negative sale_count", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, sale_count: -1 }).success).toBe(false);
	});

	it("rejects non-integer sale_count", () => {
		expect(RawAreaStatsEventSchema.safeParse({ ...validEvent, sale_count: 1.5 }).success).toBe(false);
	});

	it("rejects a missing required field", () => {
		const { quarter: _, ...withoutQuarter } = validEvent;
		expect(RawAreaStatsEventSchema.safeParse(withoutQuarter).success).toBe(false);
	});
});
