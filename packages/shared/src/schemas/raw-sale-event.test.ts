import { describe, expect, it } from "vitest";
import { RawSaleEventSchema } from "./raw-sale-event";

const validEvent = {
	sale_date: "2024-06-15",
	postal_code: "00180",
	address: "Kampinkuja 1",
	price: 350000,
	square_meters: 52.5,
	rooms: 2,
	building_type: "kerrostalo",
	building_year: 1972,
};

describe("RawSaleEventSchema", () => {
	it("accepts a valid event", () => {
		expect(RawSaleEventSchema.safeParse(validEvent).success).toBe(true);
	});

	it("accepts building_year as null", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, building_year: null }).success).toBe(true);
	});

	it("rejects a missing required field", () => {
		const { price: _, ...withoutPrice } = validEvent;
		expect(RawSaleEventSchema.safeParse(withoutPrice).success).toBe(false);
	});

	it("rejects price of 0", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, price: 0 }).success).toBe(false);
	});

	it("rejects negative price", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, price: -1000 }).success).toBe(false);
	});

	it("rejects non-integer price", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, price: 350000.5 }).success).toBe(false);
	});

	it("rejects negative square_meters", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, square_meters: -1 }).success).toBe(false);
	});

	it("rejects zero square_meters", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, square_meters: 0 }).success).toBe(false);
	});

	it("rejects building_year below 1800", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, building_year: 1799 }).success).toBe(false);
	});

	it("rejects building_year above 2100", () => {
		expect(RawSaleEventSchema.safeParse({ ...validEvent, building_year: 2101 }).success).toBe(false);
	});
});
