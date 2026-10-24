import React from 'react';
import EpiDataPage from '../components/EpiDataPage';

const TABLE_COLUMNS = [
  { label: 'Country / Area',      key: 'country_area', className: 'country-cell' },
  { label: 'Published Period',    key: 'published_period' },
  { label: 'Study Year',          key: 'study_year' },
  { label: 'Disease Name',        key: 'disease_name', className: 'disease-cell' },
  { label: 'Gender Type',         key: 'gender_type' },
  { label: 'Age',                 key: 'age_group' },
  { label: 'Epidemiology Metric', key: 'epi_metric' },
  { label: 'Estimate',            key: 'estimate' },
  { label: 'Epi Value',           key: 'epi_value', className: 'value-cell' },
  { label: 'Study Sample Type',   key: 'study_sample_type' },
  { label: 'Reference',           key: 'reference', className: 'ref-cell' },
  { label: 'Date of Update',      key: 'date_of_update' },
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
  { label: 'Disease ICD code',                        key: 'disease_icd_code' },
  { label: 'Disease definition',                      key: 'disease_definition' },
  { label: 'Gender type',                             key: 'gender_type' },
  { label: 'Age',                                     key: 'age_group' },
  { label: 'Race',                                    key: 'race' },
  { label: 'Ethnicity',                               key: 'ethnicity' },
  { label: 'Epidemiology metric',                     key: 'epi_metric' },
  { label: 'Estimate (per 10,000 / 100,000 / cases)', key: 'estimate' },
  { label: 'Epi value',                               key: 'epi_value' },
  { label: 'Study sample type',                       key: 'study_sample_type' },
  { label: 'Study design',                            key: 'study_design' },
  { label: 'Data source type',                        key: 'data_source_type' },
  { label: 'Reference',                               key: 'reference' },
  { label: 'URL',                                     key: 'url' },
  { label: 'Date of update',                          key: 'date_of_update' },
];

export default function Incidence() {
  return (
    <EpiDataPage
      apiPath="/incidence"
      typeKey="epi_metric"
      typeLabel="Epidemiology metric"
      title="Incidence"
      tableColumns={TABLE_COLUMNS}
      exportColumns={EXPORT_COLUMNS}
      insights
    />
  );
}
