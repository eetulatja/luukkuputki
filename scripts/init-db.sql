CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS area_stats (
    quarter                  DATE        NOT NULL,
    postal_code              VARCHAR     NOT NULL,
    building_type            VARCHAR     NOT NULL,
    avg_price_per_sqm        DECIMAL     NOT NULL,
    sale_count               INTEGER     NOT NULL,
    area_label               VARCHAR     NOT NULL,
    district                 VARCHAR     NOT NULL,
    deviation_from_pks_avg   DECIMAL,
    ingestion_timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT area_stats_natural_key
        UNIQUE (postal_code, quarter, building_type)
);

SELECT create_hypertable('area_stats', 'quarter', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_area_stats_postal_code ON area_stats (postal_code);
CREATE INDEX IF NOT EXISTS idx_area_stats_district    ON area_stats (district);
