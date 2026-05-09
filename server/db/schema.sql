-- ============================================================
-- RED: Rare Disease Epi Database — MySQL Schema v2
-- Schema matches the actual data columns from the Excel source
-- ============================================================

CREATE DATABASE IF NOT EXISTS red_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE red_database;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@red.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ------------------------------------------------------------
-- Main epi data table — mirrors the Excel columns exactly
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS epi_data (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  country_area             VARCHAR(200) NOT NULL,
  published_period         VARCHAR(20),
  study_year               VARCHAR(30),
  disease_name             VARCHAR(200) NOT NULL,
  gender_type              VARCHAR(50),
  age_group                TEXT,
  race                     VARCHAR(200),
  ethnicity                VARCHAR(200),
  epi_metric               VARCHAR(300),
  prevalence_estimate_text VARCHAR(300),
  value_estimation         DECIMAL(12,4),
  study_sample_size        TEXT,
  study_design             VARCHAR(300),
  reference                TEXT,
  url                      TEXT,
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  country_area             VARCHAR(200) NOT NULL,
  continent                VARCHAR(100)
);

-- ------------------------------------------------------------
-- Definitions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS definitions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  term       VARCHAR(200) NOT NULL,
  definition TEXT NOT NULL,
  category   VARCHAR(100)
);

INSERT INTO definitions (term, definition, category) VALUES
  ('Total prevalence','The proportion of a population that has a condition at a specific point or period in time, including all existing cases.','Epi metric'),
  ('Point prevalence','The proportion of a population with a condition at a single specific point in time.','Epi metric'),
  ('Live-birth prevalence','The number of affected live births per unit of total live births in a population.','Epi metric'),
  ('Birth prevalence','The number of cases identified at or around birth per unit of total births (live and/or stillbirths).','Epi metric'),
  ('Incidence','The rate of new cases of a disease arising in a specified population over a defined time period.','Epi metric'),
  ('Diagnosed incidence','The rate of newly diagnosed (clinically confirmed) cases of a condition in a given population and time period.','Epi metric'),
  ('Per 100,000','Standard epidemiological representation: number of cases per 100,000 individuals in the reference population.','Value representation'),
  ('Newborn screening','A public health program that screens newborns shortly after birth for certain treatable conditions before symptoms appear.','Study design'),
  ('Rare disease','A disease that affects fewer than 1 in 2,000 people in Europe, or fewer than 200,000 in the US (Orphan Drug Act definition).','Classification'),
  ('Fabry disease','An X-linked lysosomal storage disorder caused by deficiency of the enzyme alpha-galactosidase A (GLA gene mutation), leading to multi-organ damage.','Disease'),
  ('Achondroplasia','The most common form of short-limb skeletal dysplasia, caused by an autosomal dominant mutation in the FGFR3 gene.','Disease'),
  ('Systematic review','A structured review of all available evidence on a specific question, following a pre-defined protocol to minimise bias.','Study design'),
  ('Registry-based study','A study that uses data from a disease or patient registry to estimate prevalence, incidence, or outcomes.','Study design');

-- ============================================================
-- SEED: all 40 rows from Sample_data.csv
-- ============================================================
INSERT INTO epi_data
  (country_area,published_period,study_year,disease_name,gender_type,age_group,race,ethnicity,epi_metric,prevalence_estimate_text,value_estimation,study_sample_size,study_design,reference,url)
VALUES
('Worldwide','2026','2015','Fabry disease','Both','Childhood to adulthood onset; birth prevalence summary','Pan-ethnic / not race-restricted','Global / not specified','Total prevalence','10 50 per 100,000',10.5,'Rare disease database summary','Database / disease page summary','Orphanet disease database entry for Fabry disease (ORPHA:324).','https://www.orpha.net/en/disease/detail/324'),
('Worldwide','2026','2001','Fabry disease','Both','At birth / live-birth prevalence summary','Pan-ethnic / not race-restricted','Global / not specified','Live-birth prevalence','6.67 per 100,000 live births',6.67,'Rare disease database summary','Database / disease page summary','Orphanet disease database entry for Fabry disease (ORPHA:324).','https://www.orpha.net/en/disease/detail/324'),
('Worldwide','2010','2001','Fabry disease','Female','Childhood onset classic form; later-onset adulthood variants','Pan-ethnic','Global / not specified','Incidence','1 per 100,000 annually',1,'Review article summary of Fabry epidemiology','Narrative review','Germain DP. Fabry disease. Orphanet Journal of Rare Diseases. 2010.','https://link.springer.com/article/10.1186/1750-1172-5-30'),
('Worldwide','2022','2001','Fabry disease','Both','All ages in cited background estimates','Not specified','Global / not specified','Clinically ascertained prevalence','0.59 2.5 per 100,000 individuals',59,'Global prevalence estimates cited in UK Biobank study background','Background epidemiology summary within population exome-screening study','Gilchrist M et al. Prevalence of Fabry disease-causing variants in the UK Biobank. J Med Genet. 2022.','https://jmg.bmj.com/content/jmedgenet/early/2022/08/17/jmg-2022-108523.full.pdf'),
('Worldwide','2024','2001','Fabry disease','Female','Newborns','Mixed / multinational','Mixed / multinational','Pooled newborn prevalence','10 per 100,000 (~10 per 100,000)',10,'15 newborn screening studies; 11,108,793 newborns','Systematic review and meta-analysis of screening studies','Monda E et al. Impact of GLA Variant Classification on the Estimated Prevalence of Fabry Disease. Circ Genom Precis Med. 2024.','https://www.ahajournals.org/doi/pdf/10.1161/CIRCGEN.123.004252?download=true'),
('Italy','2006','2001','Fabry disease','Male','Neonates / newborns','Not reported','Italian','Diagnosed incidence in male newborn screening','32.26 per 100,000 male neonates',32.26,'37,104 consecutive Italian male neonates','Newborn screening study','Spada M et al. High Incidence of Later-Onset Fabry Disease Revealed by Newborn Screening. Am J Hum Genet. 2006.','https://core.ac.uk/download/pdf/82499535.pdf'),
('Italy','2006','2001','Fabry disease','Male','Neonates / newborns','Not reported','Italian','Diagnosed incidence in male newborn screening (known disease-causing mutations only)','21.74 per 100,000 male neonates',21.74,'37,104 consecutive Italian male neonates','Newborn screening study','Spada M et al. High Incidence of Later-Onset Fabry Disease Revealed by Newborn Screening. Am J Hum Genet. 2006.','https://core.ac.uk/download/pdf/82499535.pdf'),
('Italy','2021','2001','Fabry disease','Both','Newborns','Not reported','Italian','Diagnosed incidence in newborn screening','12.69 per 100,000 newborns',12.69,'More than 170,000 newborns; 22 males confirmed with GLA variants','Long-term newborn screening cohort','Gragnaniello V et al. Newborn Screening for Fabry Disease in Northeastern Italy: Results of Five Years of Experience. Biomolecules. 2021.','https://europepmc.org/article/PMC/PMC8301924'),
('Taiwan','2009','2001','Fabry disease','Both','Newborns','East Asian','Taiwanese','Diagnosed incidence in male newborn screening','80 per 100,000 male newborns',80,'171,977 newborns total; 90,288 male newborns screened','Pilot newborn screening study','Hwu WL et al. Newborn screening for Fabry disease in Taiwan reveals a high incidence of the later-onset GLA mutation c.936+919G>A (IVS4+919G>A). Hum Mutat. 2009.','https://scholars.mssm.edu/en/publications/newborn-screening-for-fabry-disease-in-taiwan-reveals-a-high-inci-2/'),
('Japan','2013','2001','Fabry disease','Both','Neonates / newborns','East Asian','Japanese','Test-positive prevalence in newborn screening','33.07 per 100,000 newborns',33.07,'21,170 neonates in pilot newborn screening study','Pilot newborn screening study','Inoue T et al. Newborn screening for Fabry disease in Japan: prevalence and genotypes of Fabry disease in a pilot study. J Hum Genet. 2013.','https://www.nature.com/articles/jhg201348'),
('Japan','2013','2001','Fabry disease','Both','Neonates / newborns','East Asian','Japanese','Diagnosed incidence in newborn screening (pathogenic mutation)','14.17 per 100,000 newborns',14.17,'21,170 neonates in pilot newborn screening study','Pilot newborn screening study','Inoue T et al. Newborn screening for Fabry disease in Japan: prevalence and genotypes of Fabry disease in a pilot study. J Hum Genet. 2013.','https://www.nature.com/articles/jhg201348'),
('China','2024','2001','Fabry disease','Female','Newborns','East Asian','Chinese','Estimated incidence in newborn genetic screening','75.7 per 100,000 newborns',75.7,'17,171 newborns screened genetically for pathogenic GLA variants','Retrospective newborn genetic screening study','Sun Y et al. Newborn genetic screening for Fabry disease: Insights from a retrospective analysis in Nanjing, China. Clin Chim Acta. 2024.','https://scispace.com/papers/newborn-genetic-screening-for-fabry-disease-insights-from-a-3nrxlmuq19'),
('United Kingdom','2022','2001','Fabry disease','Both','Older adults; recruited age 37 73 years','Predominantly European ancestry','UK Biobank participants; ethnicity not fully specified in snippet','Point prevalence of likely pathogenic Fabry disease-causing variants','17.94 per 100,000 older adults',17.94,'200,643 UK Biobank participants with exome sequencing','Population exome-screening study','Gilchrist M et al. Prevalence of Fabry disease-causing variants in the UK Biobank. J Med Genet. 2022.','https://jmg.bmj.com/content/jmedgenet/early/2022/08/17/jmg-2022-108523.full.pdf'),
('United Kingdom','2022','2001','Fabry disease','Both','Older adults; recruited age 37 73 years','Predominantly European ancestry','UK Biobank participants; ethnicity not fully specified in snippet','Point prevalence of late-onset Fabry disease-causing variants','17.45 per 100,000',17.45,'200,643 UK Biobank participants with exome sequencing','Population exome-screening study','Gilchrist M et al. Prevalence of Fabry disease-causing variants in the UK Biobank. J Med Genet. 2022.','https://jmg.bmj.com/content/jmedgenet/early/2022/08/17/jmg-2022-108523.full.pdf'),
('United Kingdom','2022','2001','Fabry disease','Both','Older adults; recruited age 37 73 years','Predominantly European ancestry','UK Biobank participants; ethnicity not fully specified in snippet','Point prevalence of classic Fabry disease-causing variants','0.5 per 100,000',0.5,'200,643 UK Biobank participants with exome sequencing','Population exome-screening study','Gilchrist M et al. Prevalence of Fabry disease-causing variants in the UK Biobank. J Med Genet. 2022.','https://jmg.bmj.com/content/jmedgenet/early/2022/08/17/jmg-2022-108523.full.pdf'),
('Portugal','2025','2001','Fabry disease','Both','Adults with unexplained cardiomyopathy / LVH','Not reported','Portuguese hospital cohort','Prevalence in high-risk cardiology cohort','3400 per 100,000 (14/409)',3400,'Patients with unexplained cardiomyopathies from 10 central hospitals','Multicenter observational screening study','Machado R et al. Fabry Disease Screening in Patients with Idiopathic HCM or LVH: Data from the Multicentric Nationwide F-CHECK Study. Biomedicines. 2025.','https://www.mdpi.com/2227-9059/13/10/2530'),
('Canada','2026','2001','Fabry disease','Both','Not specified','Not specified','Nova Scotia founder population / not further specified','Prevalence / incidence in founder population','6.67 per 100,000',6.67,'Regional founder-effect estimate (Nova Scotia)','Secondary epidemiology summary (conference slide set)','Schiffmann R. Epidemiology (Relevance to Screening) and the Natural Course of Fabry Disease; cites Nova Scotia founder effect.','https://kdigo.org/wp-content/uploads/2017/02/Schiffmann_Epidemiology.pdf'),
('United States (Missouri)','2026','2001','Fabry disease','Male','Newborns','Not specified','Not specified','Incidence estimate in male newborn screening','66.67 per 100,000 males',66.67,'Informational summary of U.S. newborn screening estimates','Secondary informational source','Revvity Roadmap2Rare Fabry Disease informational page summarizing U.S. newborn screening estimates.','https://www.revvity.com/category/r2r-fabry-disease'),
('United States (Washington State)','2026','2001','Fabry disease','Male','Newborns','Not specified','Not specified','Incidence estimate in male newborn screening','12.82 per 100,000 males',12.82,'Informational summary of U.S. newborn screening estimates','Secondary informational source','Revvity Roadmap2Rare Fabry Disease informational page summarizing U.S. newborn screening estimates.','https://www.revvity.com/category/r2r-fabry-disease'),
('Worldwide','2020','1995','Achondroplasia','Both','Birth prevalence summary','Not specified / mixed global populations','Global / not specified','Birth prevalence','4.6 per 100,000 births',4.6,'Published achondroplasia prevalence literature worldwide','Systematic literature review and meta-analysis','Foreman PK et al. Birth prevalence of achondroplasia: A systematic literature review and meta-analysis. Am J Med Genet A. 2020.','https://europepmc.org/article/PMC/PMC7540685'),
('Worldwide','2026','2001','Achondroplasia','Both','At birth / live-birth incidence summary','Not specified / global','Global / not specified','Incidence','4 per 100,000 live births',4,'Rare disease database summary','Database / disease page summary','Orphanet disease database entry for Achondroplasia (ORPHA:15).','https://www.orpha.net/en/disease/detail/15'),
('Europe','2019','1991 2015','Achondroplasia','Both','Prenatal to infancy ascertainment within congenital anomaly registries','Not reported','European registry populations','Total prevalence','3.72 per 100,000 births',3.72,'All achondroplasia cases notified to 28 EUROCAT registries; all pregnancy outcomes','Population-based registry study','Coi A et al. Epidemiology of achondroplasia: A population-based study in Europe. Am J Med Genet A. 2019.','https://publications.jrc.ec.europa.eu/repository/handle/JRC115917'),
('Europe','2019','1991 2015','Achondroplasia','Both','Live births / infancy ascertainment','Not reported','European registry populations','Live-birth prevalence','3.05 per 100,000 live births',3.05,'Live-born achondroplasia cases within EUROCAT study population','Population-based registry study','Coi A et al. Epidemiology of achondroplasia: A population-based study in Europe. Am J Med Genet A. 2019.','https://www.beyondachondroplasia.org/en/news/news-all/global/542-epidemiology-of-achondroplasia-a-population-based-study-in-europe'),
('South America (multi-country)','2012','2007','Achondroplasia','Both','Birth prevalence','Not reported','South American multi-country populations','Birth prevalence','4.4 per 100,000 births',4.4,'Multi-country South American births (public summary listing)','Birth prevalence estimate reported in public literature summary','Barbosa-Buck et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('Argentina','2018','2009 2016','Achondroplasia','Both','Births / newborns','Not reported','Argentinian hospital births','Birth prevalence','4.75 per 100,000 births',4.75,'1,663,610 births in 160 hospitals of RENAC','Registry-based prevalence study','Duarte SP et al. Bone dysplasias in 1.6 million births in Argentina.','https://europepmc.org/article/MED/30572171'),
('Japan','2017','2011 2014','Achondroplasia','Both','Births / newborns','East Asian','Japanese','Birth prevalence','7.3 per 100,000 births',7.3,'95,994 births and 7 achondroplasia cases (public summary listing)','Birth prevalence estimate reported in public literature summary','Nishigori et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('Japan','1990','1972 1985','Achondroplasia','Both','Births / newborns','East Asian','Japanese','Birth prevalence','10.9 per 100,000 births',10.9,'27,472 births and 3 achondroplasia cases (public summary listing)','Birth prevalence estimate reported in public literature summary','Higurashi et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('United States','2012','1999 2008','Achondroplasia','Both','Births / newborns','Not reported','U.S. births','Birth prevalence','3.5 per 100,000 births',3.5,'509,283 births and 18 achondroplasia cases (public summary listing)','Birth prevalence estimate reported in public literature summary','Stevenson et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('United States','2011','1999 2006','Achondroplasia','Both','Births / newborns','Not reported','U.S. births','Birth prevalence','3.0 per 100,000 births',3,'2,993,421 births and 91 achondroplasia cases (public summary listing)','Birth prevalence estimate reported in public literature summary','Moffitt et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('United States (selected regions / 7 birth-defect monitoring programs)','2008','1968 2003','Achondroplasia','Both','Live births','Not reported','U.S. regional birth-defect registry populations','Live-birth prevalence','4.2 per 100,000 live births',4.2,'Seven population-based U.S. birth defects monitoring programs','Population-based prevalence study','Waller DK et al. The population-based prevalence of achondroplasia and thanatophoric dysplasia in selected regions of the US. Am J Med Genet A. 2008.','https://www.scilit.com/publications/9b73779ef53211c654c741692e09840a'),
('United States','1996','1972 1990','Achondroplasia','Both','Births / newborns','Not reported','U.S. births','Birth prevalence','2.4 per 100,000 births',2.4,'126,316 births and 3 achondroplasia cases (public summary listing)','Birth prevalence estimate reported in public literature summary','Rasmussen et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('France','1989','1979 1986','Achondroplasia','Both','Births / newborns','Not reported','French registry population','Birth prevalence','6.6 per 100,000 births',6.6,'Population-based congenital anomalies register; 105,374 births and 7 achondroplasia cases in public summary','Population-based register study','Stoll C et al. Birth prevalence rates of skeletal dysplasias. Clin Genet. 1989.','https://europepmc.org/article/MED/2785882'),
('France','2025','2008 2023','Achondroplasia','Both','Pediatric patients 0 15 years (live-birth prevalence estimate)','Not reported','French national registry population','Live-birth prevalence','3.27 per 100,000 live births (range 1.90 4.03)',3.27,'Pediatric patients 0 15 years born 2008 2023 in BNDMR','Nationwide retrospective registry analysis','Baujat G et al. Achondroplasia and hypochondroplasia in France: a nationwide epidemiological analysis. Orphanet J Rare Dis. 2025.','https://link.springer.com/article/10.1186/s13023-025-04069-5'),
('Denmark','1989','1970 1983','Achondroplasia','Both','Births / newborns','Not reported','Danish','Birth prevalence','1.3 per 100,000 births',1.3,'77,977 births and 1 achondroplasia case in public summary listing','Birth prevalence estimate reported in public literature summary','Andersen et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf'),
('Italy','1988','1978 1985','Achondroplasia','Both','Births / newborns','Not reported','Italian','Birth prevalence','3.7 per 100,000 births',3.7,'Italian Multicentre Monitoring System for Birth Defects; 838,717 newborns in public summary','Monitoring-system prevalence study','Camera G et al. Birth prevalence and mutation rate of achondroplasia in the Italian multicentre monitoring system for birth defects.','https://link.springer.com/content/pdf/10.1007/978-1-4684-8712-1_2.pdf?pdf=inline%20link'),
('Spain','1988','1976 1985','Achondroplasia','Both','Liveborn infants / newborns','Not reported','Spanish','Live-birth prevalence','2.7 per 100,000 live births',2.7,'553,270 liveborn infants monitored by ECEMC; 15 achondroplasia cases in public summary','Hospital-based surveillance / prevalence study','Martínez-Frías ML et al. Prevalence of dominant mutations in Spain: effect of changes in maternal age distribution. Am J Med Genet. 1988.','https://europepmc.org/article/MED/3239577'),
('Australia','1979','1969 1975','Achondroplasia','Both','Live births','Not reported','Australian state population (Victoria)','Incidence','3.85 per 100,000 live births',3.85,'State of Victoria live births with near-complete ascertainment','Statewide ascertainment study','Oberklaid F et al. Achondroplasia and hypochondroplasia. J Med Genet. 1979.','https://jmg.bmj.com/content/jmedgenet/16/2/140.full.pdf'),
('Australia','2021','2001','Achondroplasia','Both','≤19 years','Not reported','Australian state/territory cohort (NSW + ACT)','Point prevalence','5.2 per 100,000 children aged ≤19 years',5.2,'Children resident in NSW/ACT aged ≤19 years (n=109)','Childhood prevalence study using tertiary hospital cohort and population denominators','Tofts L et al. Childhood prevalence of achondroplasia in New South Wales and the Australian Capital Territory, Australia. Am J Med Genet A. 2021.','https://researchers.mq.edu.au/en/publications/childhood-prevalence-of-achondroplasia-in-new-south-wales-and-the/'),
('Australia','2021','1995','Achondroplasia','Both','Births / children born 1990 2019','Not reported','Australian state/territory cohort (NSW + ACT)','Live-birth prevalence','3.3 per 100,000 live births (1990 1999) to 5.3 per 100,000 (2010 2019)',3.3,'127 individuals with achondroplasia born in NSW/ACT between 1990 and 2019','Birth prevalence trend analysis','Tofts L et al. Childhood prevalence of achondroplasia in New South Wales and the Australian Capital Territory, Australia. Am J Med Genet A. 2021.','https://researchers.mq.edu.au/en/publications/childhood-prevalence-of-achondroplasia-in-new-south-wales-and-the/'),
('United Kingdom','1971','1951 1969','Achondroplasia','Both','Births / newborns','Not reported','UK births','Birth prevalence','4.9 per 100,000 births',4.9,'61,682 births and 3 achondroplasia cases in public summary listing','Birth prevalence estimate reported in public literature summary','Harris et al. (as listed in An Estimate of the Global Birth Prevalence of Achondroplasia public summary poster).','https://ascendispharma.com/wp-content/uploads/2020/09/Achondroplasia-Birth-Prevalance.pdf');


UPDATE epi_data SET continent = 'Global'        WHERE country_area = 'Worldwide';
UPDATE epi_data SET continent = 'Europe'        WHERE country_area IN ('France','Italy','Spain','Portugal','Denmark','United Kingdom','Europe','Germany');
UPDATE epi_data SET continent = 'North America' WHERE country_area IN ('United States','United States (Missouri)','United States (Washington State)','United States (selected regions / 7 birth-defect monitoring programs)','Canada');
UPDATE epi_data SET continent = 'Asia Pacific'  WHERE country_area IN ('Japan','China','Taiwan','India','Australia');
UPDATE epi_data SET continent = 'Latin America' WHERE country_area IN ('Argentina','Brazil','South America (multi-country)');
UPDATE epi_data SET continent = 'Middle East & Africa' WHERE country_area = 'South Africa';

