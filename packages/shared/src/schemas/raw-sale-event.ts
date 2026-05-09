import { z } from "zod";

export const RawSaleEventSchema = z.object({
	sale_date: z.string(),
	postal_code: z.string(),
	address: z.string(),
	price: z.number().int().positive(),
	square_meters: z.number().positive(),
	rooms: z.number().int().nonnegative(),
	building_type: z.string(),
	// Some records omit building year
	building_year: z.number().int().min(1800).max(2100).nullable(),
});
