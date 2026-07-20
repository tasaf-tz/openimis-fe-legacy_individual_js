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

function LegacyGroupsFilter({ filters, onChangeFilters }) {
  const intl = useIntl();
  const get = (key) => filters?.[key]?.value ?? '';

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'groupFilter.code')}
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
