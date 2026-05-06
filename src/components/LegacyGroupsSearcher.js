import React from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { Searcher, useHistory, useModulesManager, decodeId } from '@openimis/fe-core';

import { fetchLegacyGroups } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_LEGACY_GROUP_SEARCH,
} from '../constants';
import LegacyGroupsFilter from './LegacyGroupsFilter';

function _jsonExt(g) {
  const value = g?.jsonExt;
  if (!value) return {};
  if (typeof value === 'object') {
    const nested = value.json_ext || value.jsonExt;
    if (nested && typeof nested === 'object') return nested;
    if (typeof nested === 'string') {
      try {
        const parsed = JSON.parse(nested);
        return parsed && typeof parsed === 'object' ? parsed : value;
      } catch (e) {
        return value;
      }
    }
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      const nested = parsed?.json_ext || parsed?.jsonExt;
      if (nested && typeof nested === 'object') return nested;
      if (typeof nested === 'string') {
        try {
          const reparsed = JSON.parse(nested);
          return reparsed && typeof reparsed === 'object' ? reparsed : parsed;
        } catch (e) {
          return parsed && typeof parsed === 'object' ? parsed : {};
        }
      }
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }
  return {};
}

function _headName(g) {
  const head = _jsonExt(g)?.head || {};
  return [head.first_name, head.middle_name, head.last_name].filter(Boolean).join(' ');
}

function LegacyGroupsSearcher({
  fetchingLegacyGroups,
  fetchedLegacyGroups,
  fetchLegacyGroups,
  errorLegacyGroups,
  legacyGroups,
  legacyGroupsPageInfo,
  legacyGroupsTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const headers = () => [
    'Code',
    'Head of household',
    'Village',
    'PMT score',
    'HH classification',
    'Batch',
    '',
  ];

  const sorts = () => [
    ['code', true],
    ['dateCreated', true],
  ];

  const openGroup = (g) => rights.includes(RIGHT_LEGACY_GROUP_SEARCH) && history.push(
    `/${modulesManager.getRef('legacy_individual.route.group')}/${decodeId(g?.id)}`,
  );

  const itemFormatters = () => [
    (g) => g?.code,
    (g) => _headName(g),
    (g) => g?.location?.name ?? '',
    (g) => _jsonExt(g)?.pmt_score ?? '',
    (g) => _jsonExt(g)?.hh_classification ?? '',
    (g) => g?.importBatch?.code || g?.importBatch?.uuid?.slice(0, 8) || '',
    (g) => (
      <Tooltip title="View detail">
        <IconButton onClick={() => openGroup(g)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <LegacyGroupsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <Searcher
      module="legacy_individual"
      FilterPane={filterPane}
      fetch={(params) => fetchLegacyGroups(params)}
      items={legacyGroups}
      itemsPageInfo={legacyGroupsPageInfo}
      fetchedItems={fetchedLegacyGroups}
      fetchingItems={fetchingLegacyGroups}
      errorItems={errorLegacyGroups}
      tableTitle={`Legacy households (${legacyGroupsTotalCount})`}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(g) => g.id}
      onDoubleClick={openGroup}
      cacheFiltersKey="legacy_individual.LegacyGroupsSearcher"
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingLegacyGroups: state.legacy_individual.fetchingLegacyGroups,
  fetchedLegacyGroups: state.legacy_individual.fetchedLegacyGroups,
  errorLegacyGroups: state.legacy_individual.errorLegacyGroups,
  legacyGroups: state.legacy_individual.legacyGroups,
  legacyGroupsPageInfo: state.legacy_individual.legacyGroupsPageInfo,
  legacyGroupsTotalCount: state.legacy_individual.legacyGroupsTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyGroups }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyGroupsSearcher);
