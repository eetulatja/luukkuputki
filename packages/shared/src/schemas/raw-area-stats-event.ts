import { z } from "zod";

export const RawAreaStatsEventSchema = z.object({
	postal_code: z.string(),
	quarter: z.string(), // e.g. "2024Q1"
	building_type: z.enum(["kerrostalo", "rivitalo"]),
	avg_price_per_sqm: z.number().nonnegative(),
	sale_count: z.number().int().nonnegative(),
});
