#!/bin/bash
# ============================================================
# Import world population CSVs into MySQL
# Usage: bash server/db/import_population.sh
# Run from the red-database root directory
# ============================================================

DB_USER="root"
DB_NAME="red_database"

echo "Enter your MySQL password:"
read -s DB_PASS

echo ""
echo "📊 Step 1: Creating population tables..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/db/population_schema.sql
echo "✅ Tables created"

echo ""
echo "📥 Step 2: Importing population_growth_table_data.csv (~15,000 rows)..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME --local-infile=1 -e "
LOAD DATA LOCAL INFILE 'server/db/population_growth_table_data.csv'
INTO TABLE population_growth
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(index_num, variant, country, region, sub_region, type, year, gender, growth_rate);
"
echo "✅ Growth data imported"

echo ""
echo "📥 Step 3: Importing population_gender_table_data.csv (~46,000 rows)..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME --local-infile=1 -e "
LOAD DATA LOCAL INFILE 'server/db/population_gender_table_data.csv'
INTO TABLE population_gender
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(index_num, variant, country, region, sub_region, type, year, gender, cases, growth_rate);
"
echo "✅ Gender data imported"

echo ""
echo "📥 Step 4: Importing population_age_table_data.csv (~46,000 rows)..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME --local-infile=1 -e "
LOAD DATA LOCAL INFILE 'server/db/population_age_table_data.csv'
INTO TABLE population_age
FIELDS TERMINATED BY ','
ENCLOSED BY '\"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(index_num, variant, country, region, sub_region, type, year,
 age_0_4, age_5_9, age_10_14, age_15_19, age_20_24, age_25_29,
 age_30_34, age_35_39, age_40_44, age_45_49, age_50_54, age_55_59,
 age_60_64, age_65_69, age_70_74, age_75_79, age_80_84, age_85_89,
 age_90_94, age_95_99, age_100_plus, gender);
"
echo "✅ Age data imported"

echo ""
echo "🎉 All population data imported successfully!"
echo ""
echo "Verifying row counts:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 'population_growth' as table_name, COUNT(*) as rows FROM population_growth
UNION ALL
SELECT 'population_gender', COUNT(*) FROM population_gender
UNION ALL
SELECT 'population_age', COUNT(*) FROM population_age;
"
