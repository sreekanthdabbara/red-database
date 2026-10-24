-- ============================================================
-- RED: Survival Data Table
-- Run after schema.sql
-- ============================================================

USE red_database;

CREATE TABLE IF NOT EXISTS survival_data (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  region              VARCHAR(100),
  sub_region          VARCHAR(100),
  country_area        VARCHAR(200) NOT NULL,
  continent           VARCHAR(100),
  published_period    VARCHAR(20),
  study_year          VARCHAR(30),
  specialty_name      VARCHAR(200),
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
  survival_type       VARCHAR(200),
  year_of_survival    VARCHAR(100),
  estimate            VARCHAR(100),   -- unit: %, months, years
  epi_value           VARCHAR(100),
  study_sample_type   TEXT,
  study_design        VARCHAR(300),
  data_source_type    VARCHAR(200),
  reference           TEXT,
  url                 TEXT,
  date_of_update      DATE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_survival_country  ON survival_data(country_area);
CREATE INDEX idx_survival_disease  ON survival_data(disease_name);
CREATE INDEX idx_survival_region   ON survival_data(region);
CREATE INDEX idx_survival_type     ON survival_data(survival_type);
CREATE INDEX idx_survival_specialty ON survival_data(specialty_name);

-- ============================================================
-- SEED: 16 rows from Template sheet
-- ============================================================
INSERT INTO survival_data
  (region, sub_region, country_area, published_period, study_year,
   specialty_name, disease_name, icd_code, disease_icd_code,
   gender_type, age_group, race, ethnicity,
   survival_type, year_of_survival, estimate,
   study_sample_type, study_design, data_source_type, reference, url)
VALUES
('Asia','South Asia','Afghanistan','2024','1999-2022','Urology','Aggrecan deficiency (ACAN-related short stature)','ICD-10','128','Male','0-5','White','NA','Total survival','10-years','%','General population','Descriptive epidemiology','Registry','Rare net','https://www.rarenet.eu/en/'),
('Europe','Central and Eastern Europe','Albania','2025','2000-2022','Otolaryngology (ENT)','Alpha-1 antitrypsin deficiency','ICD-10','192','Female','0-5','Black','NA','Relative survival','5-years','%','Hospital admission','Community trials','Population health data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('MENA','North Africa','Algeria','2026','1999-2000','Ophthalmology','Duchenne muscular dystrophy','ICD-10','129','Both','0-5','Asian','NA','Total survival','1-years','%','Pregnant women','Screening studies','Epidemiology','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Western Europe','Andorra','2020','1999','Cardiology','ENPP1 deficiency (ARHR2, GACI)','ICD-10','128','Male','0-5','All','NA','Relative survival','Total','%','General population','Surveillance systems','Hospital data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('SSA','Southern Africa','Angola','2021','2005','Endocrinology','Fabry disease','ICD-10','192','Female','0-5','White','NA','Total survival','10-years','%','Hospital admission','Case series','Registry','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Antigua and Barbuda','2022','2007','Gastroenterology','Hypochondroplasia','ICD-10','129','Both','0-5','Black','NA','Relative survival','5-years','%','Pregnant women','Case reports','Population health data','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','South America','Argentina','2023','2010','Hematology','Idiopathic short stature','ICD-10','128','Both','0-5','Asian','NA','Total survival','1-years','%','General population','Nested case-control studies','Epidemiology','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Armenia','2024','2010','Hematology-Oncology','Mucopolysaccharidosis type I (Hurler/Scheie)','ICD-10','192','Both','0-5','All','NA','Relative survival','Total','%','Hospital admission','Case-cohort studies','Hospital data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Oceana','Australia and New Zealand','Australia','2020','2010','Medical Oncology','Mucopolysaccharidosis type IVA (Morquio A)','ICD-10','129','Both','0-5','White','NA','Total survival','10-years','%','Pregnant women','Time-series studies','Registry','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Western Europe','Austria','2021','2010','Infectious Disease','Mucopolysaccharidosis type VI (Maroteaux-Lamy)','ICD-10','128','Both','0-5','Black','NA','Relative survival','5-years','%','General population','Longitudinal studies','Population health data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Azerbaijan','2022','2010','Nephrology','Batten disease (Neuronal ceroid lipofuscinosis)','ICD-10','192','Both','All','Asian','NA','Total survival','1-years','%','Hospital admission','Meta-analysis','Epidemiology','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Bahamas','2020','2010','Neurology','Noonan syndrome','ICD-10','128','Both','All','All','NA','Relative survival','Total','%','Pregnant women','Systematic reviews','Hospital data','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('MENA','Middle East','Bahrain','2021','2010','Pulmonology','Phenylketonuria (PKU)','ICD-10','192','Both','All','White','NA','Total survival','10-years','%','General population','Population-based study','Registry','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Asia','South Asia','Bangladesh','2022','2010','Rheumatology','Pompe disease','ICD-10','129','Both','All','Black','NA','Relative survival','5-years','%','General population','Registry','Population health data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Barbados','2023','2007','Allergy and Immunology','SHOX deficiency','ICD-10','128','Both','All','Asian','NA','Total survival','1-years','%','Hospital admission','Health administrative database','Epidemiology','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Belarus','2024','2010','Psychiatry','Pompe disease','ICD-10','192','Both','All','All','NA','Relative survival','Total','%','Pregnant women','Cross-sectional study','Hospital data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/');

-- Map continents
ALTER TABLE survival_data ADD COLUMN IF NOT EXISTS continent VARCHAR(100) AFTER sub_region;

UPDATE survival_data SET continent = 'Global'         WHERE region = 'Global';
UPDATE survival_data SET continent = 'Europe'         WHERE region = 'Europe';
UPDATE survival_data SET continent = 'Asia Pacific'   WHERE region IN ('Asia', 'Oceana');
UPDATE survival_data SET continent = 'North America'  WHERE region = 'Americas' AND sub_region IN ('North America', 'Caribbean', 'Central America');
UPDATE survival_data SET continent = 'Latin America'  WHERE region = 'Americas' AND sub_region = 'South America';
UPDATE survival_data SET continent = 'Middle East & Africa' WHERE region IN ('MENA', 'SSA');
