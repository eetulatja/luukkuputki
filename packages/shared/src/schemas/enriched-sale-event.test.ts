import { describe, expect, it } from "vitest";
import { EnrichedSaleEventSchema } from "./enriched-sale-event";

const validEnrichedEvent = {
	sale_date: "2024-06-15",
	postal_code: "00180",
	address: "Kampinkuja 1",
	price: 350000,
	square_meters: 52.5,
	rooms: 2,
	building_type: "kerrostalo",
	building_year: 1972,
	price_per_sqm: 6666.67,
	area_label: "Kamppi / Ruoholahti / Jätkäsaari (00180)",
	district: "Eteläinen Helsinki",
	deviation_from_area_avg: 4.2,
	ingestion_timestamp: "2024-06-15T12:00:00.000Z",
};

describe("EnrichedSaleEventSchema", () => {
	it("accepts a valid enriched event", () => {
		expect(EnrichedSaleEventSchema.safeParse(validEnrichedEvent).success).toBe(true);
	});

	it("accepts deviation_from_area_avg as null", () => {
		const event = { ...validEnrichedEvent, deviation_from_area_avg: null };
		expect(EnrichedSaleEventSchema.safeParse(event).success).toBe(true);
	});

	it("rejects a valid raw event that is missing enriched fields", () => {
		const rawOnly = {
			sale_date: "2024-06-15",
			postal_code: "00180",
			address: "Kampinkuja 1",
			price: 350000,
			square_meters: 52.5,
			rooms: 2,
			building_type: "kerrostalo",
			building_year: 1972,
		};
		expect(EnrichedSaleEventSchema.safeParse(rawOnly).success).toBe(false);
	});

	it("rejects a missing price_per_sqm", () => {
		const { price_per_sqm: _, ...withoutPricePerSqm } = validEnrichedEvent;
		expect(EnrichedSaleEventSchema.safeParse(withoutPricePerSqm).success).toBe(false);
	});

	it("rejects negative price_per_sqm", () => {
		expect(EnrichedSaleEventSchema.safeParse({ ...validEnrichedEvent, price_per_sqm: -1 }).success).toBe(false);
	});
});
