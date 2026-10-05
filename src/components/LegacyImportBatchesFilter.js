import React from 'react';
import { useIntl } from 'react-intl';
import {
  Grid, TextField, MenuItem,
} from '@material-ui/core';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';

// status is a GraphQL ENUM (LegacyImportBatchStatus) -- emitted unquoted, not as a string.
const STATUSES = ['PENDING', 'IN_PROGRESS', 'SUCCESS', 'COMPLETED_WITH_ERRORS', 'FAIL'];

function LegacyImportBatchesFilter({ filters, onChangeFilters }) {
  const intl = useIntl();
  const get = (key) => filters?.[key]?.value ?? '';

  const setFilter = (key, value, gqlFilter) => {
    if (value === '' || value === undefined || value === null) {
      onChangeFilters([{ id: key, value: null }]);
    } else {
      onChangeFilters([{ id: key, value, filter: gqlFilter }]);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label={formatMessage(intl, 'legacy_individual', 'batchFilter.code')}
          value={get('code')}
          fullWidth
          onChange={(e) => setFilter('code', e.target.value, `code_Icontains: "${e.target.value}"`)}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          select
          label={formatMessage(intl, 'legacy_individual', 'batchFilter.status')}
          value={get('status')}
          fullWidth
          onChange={(e) => setFilter('status', e.target.value, `status: ${e.target.value}`)}
        >
          <MenuItem value="">
            {formatMessage(intl, 'legacy_individual', 'batchFilter.status.any')}
          </MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {formatMessage(intl, 'legacy_individual', `batchFilter.status.${s}`)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
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

export default LegacyImportBatchesFilter;
