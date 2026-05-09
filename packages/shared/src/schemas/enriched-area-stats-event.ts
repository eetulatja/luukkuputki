import { z } from "zod";
import { RawAreaStatsEventSchema } from "./raw-area-stats-event";

export const EnrichedAreaStatsEventSchema = RawAreaStatsEventSchema.extend({
	area_label: z.string(),
	district: z.string(),
	// Null when fewer than 5 postal codes report data for this quarter+building_type combination
	deviation_from_pks_avg: z.number().nullable(),
	ingestion_timestamp: z.string(),
});
