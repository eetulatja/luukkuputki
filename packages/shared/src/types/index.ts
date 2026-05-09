import type { z } from "zod";
import type { EnrichedSaleEventSchema } from "../schemas/enriched-sale-event";
import type { RawSaleEventSchema } from "../schemas/raw-sale-event";

export type RawSaleEvent = z.infer<typeof RawSaleEventSchema>;
export type EnrichedSaleEvent = z.infer<typeof EnrichedSaleEventSchema>;
