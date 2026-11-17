import React from 'react';
import { useIntl } from 'react-intl';
import { Grid, TextField } from '@material-ui/core';
import { PublishedComponent, formatGQLString, formatMessage } from '@openimis/fe-core';

import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE } from '../../constants';
import { setTextFilter } from '../../utils/rm4';

const TEXT_FILTERS = [
  ['code', 'rm4.filter.code', (v) => `code_Istartswith: "${formatGQLString(v)}"`],
  ['interviewKey', 'rm4.filter.interviewKey', (v) => `interviewKey: "${formatGQLString(v)}"`],
  ['pmtClass', 'rm4.filter.pmtClass', (v) => `pmtClass: "${formatGQLString(v.toUpperCase())}"`],
];

function Rm4GroupsFilter({ filters, onChangeFilters }) {
  const intl = useIntl();
  return (
    <Grid container spacing={2}>
      {TEXT_FILTERS.map(([id, label, toFilter]) => (
        <Grid item xs={4} key={id}>
          <TextField
            fullWidth
            label={formatMessage(intl, MODULE, label)}
            value={filters?.[id]?.value ?? ''}
            onChange={(e) => setTextFilter(onChangeFilters, id, e.target.value, toFilter)}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
        />
      </Grid>
    </Grid>
  );
}

export default Rm4GroupsFilter;
