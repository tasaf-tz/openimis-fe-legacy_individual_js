import React from 'react';
import { useIntl } from 'react-intl';
import { Grid, TextField } from '@material-ui/core';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';

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

  const handleLocationFilterChange = (newFilters) => {
    const location = (newFilters || []).find(
      (f) => ['parentLocation', 'location', 'districtLocation', 'regionLocation'].includes(f?.id),
    );
    const level = (newFilters || []).find((f) => f?.id === 'parentLocationLevel');
    const value = location?.value;
    const uuid = value?.uuid || value?.id || value || null;

    if (!uuid) {
      onChangeFilters([
        { id: 'parentLocation', value: null },
        { id: 'parentLocationLevel', value: null },
      ]);
      return;
    }
    onChangeFilters([
      { id: 'parentLocation', value, filter: `parentLocation: "${uuid}"` },
      {
        id: 'parentLocationLevel',
        value: level?.value ?? 0,
        filter: `parentLocationLevel: ${level?.value ?? 0}`,
      },
    ]);
  };


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
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          filters={filters}
          onChangeFilters={handleLocationFilterChange}
          anchor="parentLocation"
        />
      </Grid>
    </Grid>
  );
}

export default LegacyGroupsFilter;
