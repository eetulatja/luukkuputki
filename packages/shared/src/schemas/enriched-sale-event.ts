import { z } from "zod";
import { RawSaleEventSchema } from "./raw-sale-event";

export const EnrichedSaleEventSchema = RawSaleEventSchema.extend({
	price_per_sqm: z.number().nonnegative(),
	area_label: z.string(),
	district: z.string(),
	// Null when the area has fewer than 5 historical sales
	deviation_from_area_avg: z.number().nullable(),
	ingestion_timestamp: z.string(),
});
