-- ============================================================
-- World Population Tables — RED Database
-- Run this AFTER schema.sql
-- ============================================================

USE red_database;

-- ------------------------------------------------------------
-- 1. Population Growth Rate table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS population_growth (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  index_num   INT,
  variant     VARCHAR(50),
  country     VARCHAR(200),
  region      VARCHAR(100),
  sub_region  VARCHAR(100),
  type        VARCHAR(100),
  year        INT,
  gender      VARCHAR(20),
  growth_rate DECIMAL(10,4)
);

-- ------------------------------------------------------------
-- 2. Population by Gender (Cases + Growth Rate)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS population_gender (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  index_num   INT,
  variant     VARCHAR(50),
  country     VARCHAR(200),
  region      VARCHAR(100),
  sub_region  VARCHAR(100),
  type        VARCHAR(100),
  year        INT,
  gender      VARCHAR(20),
  cases       DECIMAL(20,4),
  growth_rate DECIMAL(10,4)
);

-- ------------------------------------------------------------
-- 3. Population by Age Group
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS population_age (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  index_num       INT,
  variant         VARCHAR(50),
  country         VARCHAR(200),
  region          VARCHAR(100),
  sub_region      VARCHAR(100),
  type            VARCHAR(100),
  year            INT,
  age_0_4         DECIMAL(20,4),
  age_5_9         DECIMAL(20,4),
  age_10_14       DECIMAL(20,4),
  age_15_19       DECIMAL(20,4),
  age_20_24       DECIMAL(20,4),
  age_25_29       DECIMAL(20,4),
  age_30_34       DECIMAL(20,4),
  age_35_39       DECIMAL(20,4),
  age_40_44       DECIMAL(20,4),
  age_45_49       DECIMAL(20,4),
  age_50_54       DECIMAL(20,4),
  age_55_59       DECIMAL(20,4),
  age_60_64       DECIMAL(20,4),
  age_65_69       DECIMAL(20,4),
  age_70_74       DECIMAL(20,4),
  age_75_79       DECIMAL(20,4),
  age_80_84       DECIMAL(20,4),
  age_85_89       DECIMAL(20,4),
  age_90_94       DECIMAL(20,4),
  age_95_99       DECIMAL(20,4),
  age_100_plus    DECIMAL(20,4),
  gender          VARCHAR(20)
);

-- Add indexes for fast filtering
CREATE INDEX idx_growth_country  ON population_growth(country);
CREATE INDEX idx_growth_year     ON population_growth(year);
CREATE INDEX idx_growth_region   ON population_growth(region);
CREATE INDEX idx_gender_country  ON population_gender(country);
CREATE INDEX idx_gender_year     ON population_gender(year);
CREATE INDEX idx_gender_gender   ON population_gender(gender);
CREATE INDEX idx_age_country     ON population_age(country);
CREATE INDEX idx_age_year        ON population_age(year);
