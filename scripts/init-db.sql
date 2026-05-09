CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS apartment_sales (
    sale_date                DATE        NOT NULL,
    postal_code              VARCHAR     NOT NULL,
    area_label               VARCHAR     NOT NULL,
    district                 VARCHAR     NOT NULL,
    address                  VARCHAR     NOT NULL,
    price                    INTEGER     NOT NULL,
    square_meters            DECIMAL     NOT NULL,
    rooms                    SMALLINT,
    building_type            VARCHAR,
    building_year            SMALLINT,
    price_per_sqm            DECIMAL,
    deviation_from_area_avg  DECIMAL,
    ingestion_timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT apartment_sales_natural_key
        UNIQUE (postal_code, address, sale_date, price, square_meters)
);

SELECT create_hypertable('apartment_sales', 'sale_date', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_apartment_sales_postal_code ON apartment_sales (postal_code);
CREATE INDEX IF NOT EXISTS idx_apartment_sales_district    ON apartment_sales (district);

CREATE MATERIALIZED VIEW IF NOT EXISTS area_monthly_stats
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 month', sale_date)                                       AS bucket,
    postal_code,
    area_label,
    district,
    COUNT(*)                                                                 AS sale_count,
    AVG(price_per_sqm)                                                       AS avg_price_per_sqm,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_per_sqm)              AS median_price_per_sqm,
    MIN(price_per_sqm)                                                       AS min_price_per_sqm,
    MAX(price_per_sqm)                                                       AS max_price_per_sqm
FROM apartment_sales
WHERE price_per_sqm IS NOT NULL
GROUP BY bucket, postal_code, area_label, district
WITH NO DATA;
