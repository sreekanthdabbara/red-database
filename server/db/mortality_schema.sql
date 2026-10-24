-- ============================================================
-- RED: Mortality Data Table
-- Run after schema.sql
-- ============================================================

USE red_database;

CREATE TABLE IF NOT EXISTS mortality_data (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  region              VARCHAR(100),
  sub_region          VARCHAR(100),
  country_area        VARCHAR(200) NOT NULL,
  continent           VARCHAR(100),
  published_period    VARCHAR(20),
  study_year          VARCHAR(30),
  specialty_name      VARCHAR(200),
  specialty_1         VARCHAR(200),
  disease_name        VARCHAR(200),
  another_name        VARCHAR(200),
  synonyms            VARCHAR(200),
  icd_code            VARCHAR(50),
  disease_icd_code    VARCHAR(50),
  disease_definition  TEXT,
  gender_type         VARCHAR(50),
  age_group           VARCHAR(100),
  race                VARCHAR(200),
  ethnicity           VARCHAR(200),
  mortality_type      VARCHAR(200),
  estimate            VARCHAR(100),   -- unit: per 10,000 / per 100,000 / cases
  epi_value           VARCHAR(100),
  study_sample_type   TEXT,
  study_design        VARCHAR(300),
  data_source_type    VARCHAR(200),
  reference           TEXT,
  url                 TEXT,
  date_of_update      DATE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mortality_country   ON mortality_data(country_area);
CREATE INDEX idx_mortality_disease   ON mortality_data(disease_name);
CREATE INDEX idx_mortality_region    ON mortality_data(region);
CREATE INDEX idx_mortality_type      ON mortality_data(mortality_type);
CREATE INDEX idx_mortality_specialty ON mortality_data(specialty_name);

-- Data: node server/db/import_mortality.js "<path to RD template - Mortality.xlsx>"
