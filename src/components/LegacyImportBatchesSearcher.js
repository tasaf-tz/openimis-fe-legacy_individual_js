import React from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import {
  Searcher, useHistory, useModulesManager, decodeId,
  formatMessage, formatMessageWithValues,
} from '@openimis/fe-core';

import { fetchLegacyImportBatches } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_LEGACY_INDIVIDUAL_SEARCH,
} from '../constants';

const STATUS_STYLE = {
  SUCCESS: { color: '#2e7d32', bg: '#e8f5e9' },
  COMPLETED_WITH_ERRORS: { color: '#ef6c00', bg: '#fff3e0' },
  IN_PROGRESS: { color: '#1565c0', bg: '#e3f2fd' },
  PENDING: { color: '#616161', bg: '#f5f5f5' },
  FAIL: { color: '#c62828', bg: '#ffebee' },
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

function methodLabel(intl, b) {
  if (b?.sourceSystem === 'PSSN_API') return formatMessage(intl, 'legacy_individual', 'batchSearcher.method.api');
  if (b?.sourceSystem === 'PSSN') return formatMessage(intl, 'legacy_individual', 'batchSearcher.method.csv');
  return b?.sourceSystem || '—';
}

function StatusChip({ status }) {
  const intl = useIntl();
  const s = STATUS_STYLE[status] || { color: '#616161', bg: '#f5f5f5' };
  let label = status || '—';
  if (STATUS_STYLE[status]) {
    label = formatMessage(intl, 'legacy_individual', `batchSearcher.status.${status}`);
  }
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
      {label}
    </span>
  );
}

function issuesLabel(intl, b) {
  const w = b?.warningCount || 0;
  const e = b?.errorCount || 0;
  if (!w && !e) return '—';
  const parts = [];
  if (w) parts.push(formatMessageWithValues(intl, 'legacy_individual', 'batchSearcher.issues.warnings', { count: w }));
  if (e) parts.push(formatMessageWithValues(intl, 'legacy_individual', 'batchSearcher.issues.errors', { count: e }));
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
  const intl = useIntl();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const headers = () => [
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.districtPaa'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.method'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.status'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.households'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.members'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.issues'),
    formatMessage(intl, 'legacy_individual', 'batchSearcher.header.imported'),
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
    (b) => methodLabel(intl, b),
    (b) => <StatusChip status={b?.status} />,
    (b) => `${b?.successHouseholdCount ?? 0} / ${b?.totalHouseholds ?? 0}`,
    (b) => `${b?.successMemberCount ?? 0} / ${b?.totalMembers ?? 0}`,
    (b) => issuesLabel(intl, b),
    (b) => formatDate(b?.dateCreated),
    (b) => (
      <Tooltip title={formatMessage(intl, 'legacy_individual', 'common.viewDetail')}>
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
      tableTitle={formatMessageWithValues(
        intl, 'legacy_individual', 'batchSearcher.tableTitle',
        { count: legacyImportBatchesTotalCount ?? 0 },
      )}
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
