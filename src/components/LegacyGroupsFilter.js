import React from 'react';
import { Grid, TextField } from '@material-ui/core';

function setFilter(onChangeFilters, key, value, gqlFilter) {
  if (value === '' || value === undefined || value === null) {
    onChangeFilters([{ id: key, value: null }]);
  } else {
    onChangeFilters([{ id: key, value, filter: gqlFilter }]);
  }
}

function LegacyGroupsFilter({ filters, onChangeFilters }) {
  const get = (key) => filters?.[key]?.value ?? '';

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <TextField
          label="Household code (REGISTRATIONNO)"
          value={get('code')}
          fullWidth
          onChange={(e) => setFilter(
            onChangeFilters, 'code', e.target.value,
            `code_Icontains: "${e.target.value}"`,
          )}
        />
      </Grid>
    </Grid>
  );
}

export default LegacyGroupsFilter;
