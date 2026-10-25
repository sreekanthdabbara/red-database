// ============================================================
// Shared loader: RD Excel template ("Template" sheet) → MySQL table
// Replaces all rows in the target table with the sheet's rows.
// ============================================================

const os      = require('os');
const path    = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ExcelJS = require('exceljs');
const db      = require('../config/db');

// Lowercase, drop "(...)" notes, collapse spaces: "Synonym (s)" → "synonym"
const norm = (s) => String(s ?? '')
  .toLowerCase()
  .replace(/\(.*?\)/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Unwrap ExcelJS cell values (hyperlinks, rich text, formulas, dates)
const cellValue = (v) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if (v.hyperlink)  return v.hyperlink;
    if (v.richText)   return v.richText.map(t => t.text).join('');
    if ('result' in v) return cellValue(v.result);
    if (v.text)       return v.text;
  }
  const s = String(v).trim();
  return s === '' ? null : s;
};

// columns: { normalized header → db column }
// fixRow:  optional (record) → record, to repair known sheet issues per row
// source:  optional tag stored in source_file; when set, only rows with that tag
//          are replaced, and other rows in the table are left untouched
async function importTemplate({ file, table, columns, fixRow = r => r, source = null }) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.resolve(file));
  const ws = wb.getWorksheet('Template');
  if (!ws) throw new Error('Sheet "Template" not found');

  // Map spreadsheet column index → db column
  const colMap = {};
  ws.getRow(1).eachCell((cell, i) => {
    const col = columns[norm(cell.value)];
    if (col) colMap[i] = col;
    else console.warn(`⚠️  Ignoring unknown column: "${cell.value}"`);
  });

  const rows = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const record = {};
    Object.entries(colMap).forEach(([i, col]) => {
      record[col] = cellValue(ws.getRow(r).getCell(+i).value);
    });
    if (record.country_area) rows.push({ ...fixRow(record), ...(source && { source_file: source }) });
  }

  // Limit the replace and the region/continent updates to this sheet's rows
  const scope  = source ? ' AND source_file = ?' : '';
  const sParam = source ? [source] : [];

  const cols = [...new Set(rows.flatMap(Object.keys))];
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM ${table} WHERE 1=1${scope}`, sParam);
    if (rows.length) {
      await conn.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES ?`,
        [rows.map(r => cols.map(c => r[c] ?? null))]
      );
    }

    // Sheets without Region / Sub-region: look them up by country
    await conn.query(`UPDATE ${table} t
      JOIN (SELECT country, MAX(region) AS region, MAX(sub_region) AS sub_region
            FROM population_growth GROUP BY country) p ON p.country = t.country_area
      SET t.region = p.region, t.sub_region = p.sub_region
      WHERE t.region IS NULL${scope.replace('source_file', 't.source_file')}`, sParam);

    // Map continents (same rules as survival_data)
    await conn.query(`UPDATE ${table} SET continent = CASE
      WHEN region = 'Global' THEN 'Global'
      WHEN region = 'Europe' THEN 'Europe'
      WHEN region IN ('Asia', 'Oceana') THEN 'Asia Pacific'
      WHEN region = 'Americas' AND sub_region IN ('North America', 'Caribbean', 'Central America') THEN 'North America'
      WHEN region = 'Americas' AND sub_region = 'South America' THEN 'Latin America'
      WHEN region IN ('MENA', 'SSA') THEN 'Middle East & Africa'
    END
    WHERE 1=1${scope}`, sParam);

    await conn.commit();
    console.log(`✅ Imported ${rows.length} rows into ${table}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Shared CLI wrapper for the import_*.js scripts.
// File defaults to ~/Documents/REED Data/<defaultName> when no path is given.
// options: a fixRow function, or { fixRow, source }
importTemplate.run = (table, columns, defaultName, options = {}) => {
  const opts = typeof options === 'function' ? { fixRow: options } : options;
  const file = process.argv[2] || path.join(os.homedir(), 'Documents', 'REED Data', defaultName);
  console.log(`📄 Reading ${file}`);
  importTemplate({ file, table, columns, ...opts })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Import failed:', err.message);
      process.exit(1);
    });
};

module.exports = importTemplate;
