import React from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { Searcher, useHistory, useModulesManager, decodeId } from '@openimis/fe-core';

import { fetchLegacyImportBatches } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_LEGACY_INDIVIDUAL_SEARCH,
} from '../constants';

function LegacyImportBatchesSearcher({
  fetchingLegacyImportBatches,
  fetchedLegacyImportBatches,
  fetchLegacyImportBatches,
  errorLegacyImportBatches,
  legacyImportBatches,
  legacyImportBatchesPageInfo,
  legacyImportBatchesTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const headers = () => [
    'Code',
    'Source',
    'Status',
    'Households',
    'Members',
    'Warnings',
    'Errors',
    'Created',
    '',
  ];

  const sorts = () => [
    ['dateCreated', true],
    ['status', true],
    ['code', true],
  ];

  const openBatch = (b) => rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && history.push(
    `/${modulesManager.getRef('legacy_individual.route.import_batch')}/${decodeId(b?.id)}`,
  );

  const itemFormatters = () => [
    (b) => b?.code || b?.uuid?.slice(0, 8),
    (b) => b?.sourceSystem,
    (b) => b?.status,
    (b) => `${b?.successHouseholdCount}/${b?.totalHouseholds}`,
    (b) => `${b?.successMemberCount}/${b?.totalMembers}`,
    (b) => b?.warningCount,
    (b) => b?.errorCount,
    (b) => b?.dateCreated,
    (b) => (
      <Tooltip title="View detail">
        <IconButton onClick={() => openBatch(b)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  return (
    <Searcher
      module="legacy_individual"
      fetch={(params) => fetchLegacyImportBatches(params)}
      items={legacyImportBatches}
      itemsPageInfo={legacyImportBatchesPageInfo}
      fetchedItems={fetchedLegacyImportBatches}
      fetchingItems={fetchingLegacyImportBatches}
      errorItems={errorLegacyImportBatches}
      tableTitle={`Legacy import batches (${legacyImportBatchesTotalCount})`}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(b) => b.id}
      onDoubleClick={openBatch}
      cacheFiltersKey="legacy_individual.LegacyImportBatchesSearcher"
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingLegacyImportBatches: state.legacy_individual.fetchingLegacyImportBatches,
  fetchedLegacyImportBatches: state.legacy_individual.fetchedLegacyImportBatches,
  errorLegacyImportBatches: state.legacy_individual.errorLegacyImportBatches,
  legacyImportBatches: state.legacy_individual.legacyImportBatches,
  legacyImportBatchesPageInfo: state.legacy_individual.legacyImportBatchesPageInfo,
  legacyImportBatchesTotalCount: state.legacy_individual.legacyImportBatchesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyImportBatches }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyImportBatchesSearcher);
