// ============================================================
// Import prevalence data from the RD Excel template into MySQL
// Usage: node server/db/import_prevalence.js ["<path to .xlsx>"]
//        (defaults to ~/Documents/REED Data/RD template - Prevalence.xlsx)
// Adds the "Template" sheet's rows to prevalence_data. Rows from earlier runs of this
// import are replaced; all other prevalence_data rows are kept.
// ============================================================

const importTemplate = require('./importTemplate');

// Excel header (lowercased, "(...)" removed) → prevalence_data column
importTemplate.run('prevalence_data', {
  'region':                                               'region',
  'saub-region':                                          'sub_region',
  'sub-region':                                           'sub_region',
  'country / area':                                       'country_area',
  'published period':                                     'published_period',
  'study year':                                           'study_year',
  'specialty name':                                       'specialty',
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
  'epidemiology metric':                                  'epi_metric',
  'estimate':                                             'prevalence_estimate_text',
  'epi value':                                            'value_estimation',
  'study sample type of population type or disease type': 'study_sample_size',
  'study design':                                         'study_design',
  'data source type':                                     'data_source_type',
  'reference':                                            'reference',
  'url':                                                  'url',
  'date of update':                                       'date_of_update',
}, 'RD template - Prevalence.xlsx', { source: 'RD template - Prevalence.xlsx' });
