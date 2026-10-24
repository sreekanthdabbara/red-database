// ============================================================
// Import genetic mutation rate data from the RD Excel template into MySQL
// Usage: node server/db/import_mutation_rate.js ["<path to .xlsx>"]
//        (defaults to ~/Documents/REED Data/RD template - Mutation rate.xlsx)
// Replaces all rows in mutation_rate_data with the "Template" sheet.
// ============================================================

const importTemplate = require('./importTemplate');

const isNumber = (v) => v !== null && v !== '' && !isNaN(Number(v));

// In the Oct 2026 template, values after "Genetic mutation rate" sit one header
// to the left of where they belong (Epi value under "Study individual/test
// group", Study sample type under "Epi value", …). Realign only rows that
// show this pattern, so a corrected sheet still loads by header.
const fixShiftedRow = (r) => {
  if (isNumber(r.epi_value) || !isNumber(r.study_group)) return r;
  return {
    ...r,
    study_group:       null,
    epi_value:         r.study_group,
    study_sample_type: r.epi_value,
    study_design:      r.study_sample_type,
    data_source_type:  r.study_design,
  };
};

// Excel header (lowercased, "(...)" removed) → mutation_rate_data column
importTemplate.run('mutation_rate_data', {
  'region':                                               'region',
  'saub-region':                                          'sub_region',
  'sub-region':                                           'sub_region',
  'country / area':                                       'country_area',
  'published period':                                     'published_period',
  'study year':                                           'study_year',
  'specialty name':                                       'specialty_name',
  'specialty 1':                                          'specialty_1',
  'disease name':                                         'disease_name',
  'another name of disease':                              'another_name',
  'synonym':                                              'synonyms',
  'icd code':                                             'icd_code',
  'disease icd code':                                     'disease_icd_code',
  'disease definition':                                   'disease_definition',
  'gender type':                                          'gender_type',
  'age':                                                  'age_group',
  'race':                                                 'race',
  'ethnicity':                                            'ethnicity',
  'genetic mutation rate':                                'mutation_type',
  'study individual/test group':                          'study_group',
  'estimate':                                             'estimate',
  'epi value':                                            'epi_value',
  'study sample type of population type or disease type': 'study_sample_type',
  'study design':                                         'study_design',
  'data source type':                                     'data_source_type',
  'reference':                                            'reference',
  'url':                                                  'url',
  'date of update':                                       'date_of_update',
}, 'RD template - Mutation rate.xlsx', fixShiftedRow);
