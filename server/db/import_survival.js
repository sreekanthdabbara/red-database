// ============================================================
// Import survival data from the RD Excel template into MySQL
// Usage: node server/db/import_survival.js ["<path to .xlsx>"]
//        (defaults to ~/Documents/REED Data/RD template - Survival.xlsx)
// Replaces all rows in survival_data with the "Template" sheet.
// ============================================================

const importTemplate = require('./importTemplate');

// Excel header (lowercased, "(...)" removed) → survival_data column
importTemplate.run('survival_data', {
  'region':                                               'region',
  'saub-region':                                          'sub_region',
  'sub-region':                                           'sub_region',
  'country / area':                                       'country_area',
  'published period':                                     'published_period',
  'study year':                                           'study_year',
  'specialty name':                                       'specialty_name',
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
  'survival type':                                        'survival_type',
  'year of survival':                                     'year_of_survival',
  'estimate':                                             'estimate',
  'epi value':                                            'epi_value',
  'study sample type of population type or disease type': 'study_sample_type',
  'study design':                                         'study_design',
  'data source type':                                     'data_source_type',
  'reference':                                            'reference',
  'url':                                                  'url',
  'date of update':                                       'date_of_update',
}, 'RD template - Survival.xlsx');
