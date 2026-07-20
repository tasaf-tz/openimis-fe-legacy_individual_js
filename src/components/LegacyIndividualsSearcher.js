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

import { fetchLegacyIndividuals } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_LEGACY_INDIVIDUAL_SEARCH,
} from '../constants';
import LegacyIndividualsFilter from './LegacyIndividualsFilter';

function LegacyIndividualsSearcher({
  fetchingLegacyIndividuals,
  fetchedLegacyIndividuals,
  fetchLegacyIndividuals,
  errorLegacyIndividuals,
  legacyIndividuals,
  legacyIndividualsPageInfo,
  legacyIndividualsTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const headers = () => [
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.name'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.gender'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.dob'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.nin'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.premno'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.phone'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.householdCode'),
    formatMessage(intl, 'legacy_individual', 'individualSearcher.header.batch'),
    '',
  ];

  const sorts = () => [
    ['lastName', true],
    ['firstName', true],
    ['dob', true],
  ];

  const fetch = (params) => fetchLegacyIndividuals(params);

  const rowIdentifier = (ind) => ind.id;

  const openIndividual = (ind) => rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && history.push(
    `/${modulesManager.getRef('legacy_individual.route.individual')}/${decodeId(ind?.id)}`,
  );

  const itemFormatters = () => [
    (ind) => [ind?.firstName, ind?.middleName, ind?.lastName].filter(Boolean).join(' '),
    (ind) => ind?.gender ?? '',
    (ind) => ind?.dob ?? '',
    (ind) => ind?.nin ?? '',
    (ind) => ind?.premno ?? '',
    (ind) => ind?.phoneNo ?? '',
    (ind) => ind?.legacyCode?.split('-')?.[0] ?? '',
    (ind) => ind?.importBatch?.code || ind?.importBatch?.uuid?.slice(0, 8) || '',
    (ind) => (
      <Tooltip title={formatMessage(intl, 'legacy_individual', 'common.viewDetail')}>
        <IconButton onClick={() => openIndividual(ind)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const filterPane = ({ filters, onChangeFilters }) => (
    <LegacyIndividualsFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  return (
    <Searcher
      module="legacy_individual"
      FilterPane={filterPane}
      fetch={fetch}
      items={legacyIndividuals}
      itemsPageInfo={legacyIndividualsPageInfo}
      fetchedItems={fetchedLegacyIndividuals}
      fetchingItems={fetchingLegacyIndividuals}
      errorItems={errorLegacyIndividuals}
      tableTitle={formatMessageWithValues(
        intl, 'legacy_individual', 'individualSearcher.tableTitle',
        { count: legacyIndividualsTotalCount ?? 0 },
      )}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={rowIdentifier}
      onDoubleClick={openIndividual}
      cacheFiltersKey="legacy_individual.LegacyIndividualsSearcher"
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingLegacyIndividuals: state.legacy_individual.fetchingLegacyIndividuals,
  fetchedLegacyIndividuals: state.legacy_individual.fetchedLegacyIndividuals,
  errorLegacyIndividuals: state.legacy_individual.errorLegacyIndividuals,
  legacyIndividuals: state.legacy_individual.legacyIndividuals,
  legacyIndividualsPageInfo: state.legacy_individual.legacyIndividualsPageInfo,
  legacyIndividualsTotalCount: state.legacy_individual.legacyIndividualsTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyIndividuals }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyIndividualsSearcher);
