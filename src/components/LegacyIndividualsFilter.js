import React from 'react';
import { Grid, TextField } from '@material-ui/core';

function setFilter(onChangeFilters, key, value, gqlFilter) {
  if (value === '' || value === undefined || value === null) {
    onChangeFilters([{ id: key, value: null }]);
  } else {
    onChangeFilters([{ id: key, value, filter: gqlFilter }]);
  }
}

function LegacyIndividualsFilter({ filters, onChangeFilters }) {
  const get = (key) => filters?.[key]?.value ?? '';

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="First name"
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
          label="Last name"
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
          label="NIN"
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
          label="Prem No."
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
          label="Phone"
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
          label="Gender (M/F)"
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
