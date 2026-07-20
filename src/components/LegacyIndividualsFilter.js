import React from 'react';
import { useIntl } from 'react-intl';
import { Grid, TextField } from '@material-ui/core';
import { formatMessage } from '@openimis/fe-core';

function setFilter(onChangeFilters, key, value, gqlFilter) {
  if (value === '' || value === undefined || value === null) {
    onChangeFilters([{ id: key, value: null }]);
  } else {
    onChangeFilters([{ id: key, value, filter: gqlFilter }]);
  }
}

function LegacyIndividualsFilter({ filters, onChangeFilters }) {
  const intl = useIntl();
  const get = (key) => filters?.[key]?.value ?? '';

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.firstName')}
          value={get('firstName')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'firstName', e.target.value,
            `firstName_Icontains: "${e.target.value}"`,
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.lastName')}
          value={get('lastName')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'lastName', e.target.value,
            `lastName_Icontains: "${e.target.value}"`,
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.nin')}
          value={get('nin')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'nin', e.target.value,
            `nin: "${e.target.value}"`,
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.premno')}
          value={get('premno')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'premno', e.target.value,
            `premno: "${e.target.value}"`,
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.phone')}
          value={get('phoneNo')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'phoneNo', e.target.value,
            `phoneNo_Icontains: "${e.target.value}"`,
          )}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'individualFilter.gender')}
          value={get('gender')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'gender', e.target.value,
            `gender: "${e.target.value}"`,
          )}
        />
      </Grid>
    </Grid>
  );
}

export default LegacyIndividualsFilter;
