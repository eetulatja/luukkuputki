import type { z } from "zod";
import type { EnrichedAreaStatsEventSchema } from "../schemas/enriched-area-stats-event";
import type { RawAreaStatsEventSchema } from "../schemas/raw-area-stats-event";

export type RawAreaStatsEvent = z.infer<typeof RawAreaStatsEventSchema>;
export type EnrichedAreaStatsEvent = z.infer<typeof EnrichedAreaStatsEventSchema>;
