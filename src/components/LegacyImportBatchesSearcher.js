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

const STATUS_STYLE = {
  SUCCESS: { color: '#2e7d32', bg: '#e8f5e9', label: 'Success' },
  COMPLETED_WITH_ERRORS: { color: '#ef6c00', bg: '#fff3e0', label: 'Completed with issues' },
  IN_PROGRESS: { color: '#1565c0', bg: '#e3f2fd', label: 'In progress' },
  PENDING: { color: '#616161', bg: '#f5f5f5', label: 'Pending' },
  FAIL: { color: '#c62828', bg: '#ffebee', label: 'Failed' },
};

function parseJsonExt(jsonExt) {
  if (!jsonExt) return {};
  if (typeof jsonExt === 'object') return jsonExt;
  try {
    return JSON.parse(jsonExt) || {};
  } catch {
    return {};
  }
}

function districtLabel(b) {
  const jx = parseJsonExt(b?.jsonExt);
  const name = jx.paa_name;
  const code = b?.code;
  if (code && name) return `${code} — ${name}`;
  if (name) return name;
  if (code) return code;
  return b?.uuid?.slice(0, 8) || '—';
}

function methodLabel(b) {
  if (b?.sourceSystem === 'PSSN_API') return 'API';
  if (b?.sourceSystem === 'PSSN') return 'CSV';
  return b?.sourceSystem || '—';
}

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] || { color: '#616161', bg: '#f5f5f5', label: status || '—' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.75rem',
        fontWeight: 500,
        color: s.color,
        backgroundColor: s.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function issuesLabel(b) {
  const w = b?.warningCount || 0;
  const e = b?.errorCount || 0;
  if (!w && !e) return '—';
  const parts = [];
  if (w) parts.push(`${w} warning${w > 1 ? 's' : ''}`);
  if (e) parts.push(`${e} error${e > 1 ? 's' : ''}`);
  return parts.join(' · ');
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

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
    'District / PAA',
    'Method',
    'Status',
    'Households',
    'Members',
    'Issues',
    'Imported',
    '',
  ];

  const sorts = () => [
    ['code', true],
    ['sourceSystem', true],
    ['status', true],
    null,
    null,
    null,
    ['dateCreated', true],
    null,
  ];

  const openBatch = (b) => rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && history.push(
    `/${modulesManager.getRef('legacy_individual.route.import_batch')}/${decodeId(b?.id)}`,
  );

  const itemFormatters = () => [
    (b) => districtLabel(b),
    (b) => methodLabel(b),
    (b) => <StatusChip status={b?.status} />,
    (b) => `${b?.successHouseholdCount ?? 0} / ${b?.totalHouseholds ?? 0}`,
    (b) => `${b?.successMemberCount ?? 0} / ${b?.totalMembers ?? 0}`,
    (b) => issuesLabel(b),
    (b) => formatDate(b?.dateCreated),
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
