import { describe, expect, it } from "vitest";
import { lookupPostalCode } from "./postal-codes";

describe("lookupPostalCode", () => {
	it("returns the correct entry for 00180 (Kamppi/Ruoholahti/Jätkäsaari)", () => {
		const result = lookupPostalCode("00180");
		expect(result).toBeDefined();
		expect(result?.areaLabel).toBe("Kamppi / Ruoholahti / Jätkäsaari (00180)");
		expect(result?.district).toBe("Eteläinen Helsinki");
	});

	it("returns an Espoo entry for 02100", () => {
		const result = lookupPostalCode("02100");
		expect(result).toBeDefined();
		expect(result?.district).toBe("Tapiola");
	});

	it("returns a Vantaa entry for 01300 (Tikkurila)", () => {
		const result = lookupPostalCode("01300");
		expect(result).toBeDefined();
		expect(result?.district).toBe("Tikkurila");
	});

	it("returns undefined for an unknown postal code", () => {
		expect(lookupPostalCode("99999")).toBeUndefined();
	});

	it("returns undefined for an empty string", () => {
		expect(lookupPostalCode("")).toBeUndefined();
	});

	it("returns a Leppävaara entry for 02300", () => {
		const result = lookupPostalCode("02300");
		expect(result).toBeDefined();
		expect(result?.district).toBe("Leppävaara");
	});

	it("returns a Myyrmäki entry for 01410", () => {
		const result = lookupPostalCode("01410");
		expect(result).toBeDefined();
		expect(result?.district).toBe("Myyrmäki");
	});
});
