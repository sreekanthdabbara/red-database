import React from 'react';
import EpiDataPage from '../components/EpiDataPage';

const TABLE_COLUMNS = [
  { label: 'Region',            key: 'region' },
  { label: 'Sub-region',        key: 'sub_region' },
  { label: 'Country / Area',    key: 'country_area', className: 'country-cell' },
  { label: 'Published Period',  key: 'published_period' },
  { label: 'Study Year',        key: 'study_year' },
  { label: 'Specialty Name',    key: 'specialty_name' },
  { label: 'Specialty 1',       key: 'specialty_1' },
  { label: 'Disease Name',      key: 'disease_name', className: 'disease-cell' },
  { label: 'Mortality Type',    key: 'mortality_type' },
  { label: 'Estimate',          key: 'estimate' },
  { label: 'Epi Value',         key: 'epi_value', className: 'value-cell' },
  { label: 'Study Sample Type', key: 'study_sample_type' },
  { label: 'Data Source',       key: 'data_source_type' },
  { label: 'Reference',         key: 'reference', className: 'ref-cell' },
  { label: 'Date of Update',    key: 'date_of_update' },
];

const EXPORT_COLUMNS = [
  { label: 'Region',                                  key: 'region' },
  { label: 'Sub-region',                              key: 'sub_region' },
  { label: 'Country / Area',                          key: 'country_area' },
  { label: 'Published period',                        key: 'published_period' },
  { label: 'Study year',                              key: 'study_year' },
  { label: 'Specialty name',                          key: 'specialty_name' },
  { label: 'Specialty 1',                             key: 'specialty_1' },
  { label: 'Disease name',                            key: 'disease_name' },
  { label: 'Another name of disease',                 key: 'another_name' },
  { label: 'Synonym(s)',                              key: 'synonyms' },
  { label: 'ICD code',                                key: 'icd_code' },
  { label: 'Disease ICD code',                        key: 'disease_icd_code' },
  { label: 'Disease definition',                      key: 'disease_definition' },
  { label: 'Gender type',                             key: 'gender_type' },
  { label: 'Age',                                     key: 'age_group' },
  { label: 'Race',                                    key: 'race' },
  { label: 'Ethnicity',                               key: 'ethnicity' },
  { label: 'Mortality type',                          key: 'mortality_type' },
  { label: 'Estimate (per 10,000 / 100,000 / cases)', key: 'estimate' },
  { label: 'Epi value',                               key: 'epi_value' },
  { label: 'Study sample type',                       key: 'study_sample_type' },
  { label: 'Study design',                            key: 'study_design' },
  { label: 'Data source type',                        key: 'data_source_type' },
  { label: 'Reference',                               key: 'reference' },
  { label: 'URL',                                     key: 'url' },
  { label: 'Date of update',                          key: 'date_of_update' },
];

export default function Mortality() {
  return (
    <EpiDataPage
      apiPath="/mortality"
      typeKey="mortality_type"
      typeLabel="Mortality type"
      title="Mortality"
      tableColumns={TABLE_COLUMNS}
      exportColumns={EXPORT_COLUMNS}
      insights={{ metric: 'Mortality rate', fields: { metric: 'mortality_type' } }}
    />
  );
}
