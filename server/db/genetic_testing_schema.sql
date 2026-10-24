-- ============================================================
-- RED: Genetic Testing Data Table
-- Run after schema.sql
-- ============================================================

USE red_database;

CREATE TABLE IF NOT EXISTS genetic_testing_data (
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
  genetic_test_type   VARCHAR(300),
  estimate_unit       VARCHAR(100),
  epi_value           DECIMAL(12,4),
  study_sample_type   TEXT,
  study_design        VARCHAR(300),
  data_source_type    VARCHAR(200),
  reference           TEXT,
  url                 TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gt_country   ON genetic_testing_data(country_area);
CREATE INDEX idx_gt_disease    ON genetic_testing_data(disease_name);
CREATE INDEX idx_gt_region     ON genetic_testing_data(region);
CREATE INDEX idx_gt_specialty  ON genetic_testing_data(specialty_name);
CREATE INDEX idx_gt_continent  ON genetic_testing_data(continent);

-- ============================================================
-- SEED: 16 rows from Template sheet
-- ============================================================
INSERT INTO genetic_testing_data
  (region, sub_region, country_area, published_period, study_year,
   specialty_name, disease_name, icd_code, disease_icd_code,
   gender_type, age_group, race, ethnicity,
   estimate_unit, epi_value,
   study_sample_type, study_design, data_source_type, reference, url)
VALUES
('Asia','South Asia','Afghanistan','2024','1999-2022','Urology','Aggrecan deficiency (ACAN-related short stature)','ICD-10','128','Male','0-5','White','NA','%',22.2,'General population','Descriptive epidemiology','Registry','Rare net','https://www.rarenet.eu/en/'),
('Europe','Central and Eastern Europe','Albania','2025','2000-2022','Otolaryngology (ENT)','Alpha-1 antitrypsin deficiency','ICD-10','192','Female','0-5','Black','NA','%',11.2,'Hospital in patient','Community trials','Population health data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('MENA','North Africa','Algeria','2026','1999-2000','Ophthalmology','Duchenne muscular dystrophy','ICD-10','129','Both','0-5','Asian','NA','%',3.1,'General population','Screening studies','Epidemiology','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Western Europe','Andorra','2020','1999','Cardiology','ENPP1 deficiency (ARHR2, GACI)','ICD-10','128','Male','0-5','All','NA','%',2.5,'General population','Surveillance systems','Hospital data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('SSA','Southern Africa','Angola','2021','2005','Endocrinology','Fabry disease','ICD-10','192','Female','0-5','White','NA','%',6.8,'General population','Case series','Registry','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Antigua and Barbuda','2022','2007','Gastroenterology','Hypochondroplasia','ICD-10','129','Both','0-5','Black','NA','%',7.6,'General population','Case reports','Population health data','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','South America','Argentina','2023','2010','Hematology','Idiopathic short stature','ICD-10','128','Both','0-5','Asian','NA','%',22.0,'General population','Nested case-control studies','Epidemiology','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Armenia','2024','2010','Hematology-Oncology','Mucopolysaccharidosis type I (Hurler/Scheie)','ICD-10','192','Both','0-5','All','NA','%',77.0,'General population','Case-cohort studies','Hospital data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Oceana','Australia and New Zealand','Australia','2020','2010','Medical Oncology','Mucopolysaccharidosis type IVA (Morquio A)','ICD-10','129','Both','0-5','White','NA','%',77.0,'General population','Time-series studies','Registry','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Western Europe','Austria','2021','2010','Infectious Disease','Mucopolysaccharidosis type VI (Maroteaux-Lamy)','ICD-10','128','Both','0-5','Black','NA','%',88.0,'General population','Longitudinal studies','Population health data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Azerbaijan','2022','2010','Nephrology','Batten disease (Neuronal ceroid lipofuscinosis)','ICD-10','192','Both','All','Asian','NA','%',11.0,'General population','Meta-analysis','Epidemiology','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Bahamas','2020','2010','Neurology','Noonan syndrome','ICD-10','128','Both','All','All','NA','%',90.0,'General population','Systematic reviews','Hospital data','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('MENA','Middle East','Bahrain','2021','2010','Pulmonology','Phenylketonuria (PKU)','ICD-10','192','Both','All','White','NA','%',77.0,'General population','Population-based study','Registry','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Asia','South Asia','Bangladesh','2022','2010','Rheumatology','Pompe disease','ICD-10','129','Both','All','Black','NA','%',66.0,'General population','Registry','Population health data','Publication','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Americas','Caribbean','Barbados','2023','2007','Allergy and Immunology','SHOX deficiency','ICD-10','128','Both','All','Asian','NA','%',33.0,'General population','Health administrative database','Epidemiology','WHO','https://pubmed.ncbi.nlm.nih.gov/37738999/'),
('Europe','Central and Eastern Europe','Belarus','2024','2010','Psychiatry','Pompe disease','ICD-10','192','Both','All','All','NA','%',66.0,'General population','Cross-sectional study','Hospital data','Rare net','https://pubmed.ncbi.nlm.nih.gov/37738999/');

-- Map continents
UPDATE genetic_testing_data SET continent = 'Global'              WHERE region = 'Global';
UPDATE genetic_testing_data SET continent = 'Europe'              WHERE region = 'Europe';
UPDATE genetic_testing_data SET continent = 'Asia Pacific'        WHERE region IN ('Asia', 'Oceana');
UPDATE genetic_testing_data SET continent = 'North America'       WHERE region = 'Americas' AND sub_region IN ('North America', 'Caribbean', 'Central America');
UPDATE genetic_testing_data SET continent = 'Latin America'       WHERE region = 'Americas' AND sub_region = 'South America';
UPDATE genetic_testing_data SET continent = 'Middle East & Africa' WHERE region IN ('MENA', 'SSA');
