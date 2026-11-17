import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  Searcher, decodeId, formatMessage, formatMessageWithValues, useHistory, useModulesManager,
} from '@openimis/fe-core';

import { fetchRm4Individuals } from '../../actions';
import { DEFAULT_PAGE_SIZE, LEGACY_INDIVIDUAL_MODULE_NAME as MODULE, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { householdOf, parseJsonExt } from '../../utils/rm4';
import Rm4IndividualsFilter from './Rm4IndividualsFilter';

function Rm4IndividualsSearcher({
  fetchRm4Individuals, fetchingRm4Individuals, fetchedRm4Individuals, errorRm4Individuals, rm4Individuals,
  rm4IndividualsPageInfo, rm4IndividualsTotalCount,
}) {
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const t = (id) => formatMessage(intl, MODULE, id);

  const open = (i) => history.push(
    `/${modulesManager.getRef('legacy_individual.route.rm4_individual')}/${decodeId(i.id)}`,
  );

  const headers = () => [
    'rm4.individual.firstName', 'rm4.individual.lastName', 'rm4.individual.dob', 'rm4.individual.role',
    'rm4.individual.household', 'rm4.common.village', '',
  ].map((id) => (id ? t(id) : ''));

  const itemFormatters = () => [
    (i) => i.firstName,
    (i) => i.lastName,
    (i) => i.dob ?? '',
    (i) => parseJsonExt(i.jsonExt).individual_role ?? '',
    (i) => householdOf(i)?.code ?? '',
    (i) => i.location?.name ?? '',
    (i) => (
      <Tooltip title={t('common.viewDetail')}>
        <IconButton onClick={() => open(i)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  return (
    <Searcher
      module={MODULE}
      FilterPane={Rm4IndividualsFilter}
      fetch={fetchRm4Individuals}
      items={rm4Individuals}
      itemsPageInfo={rm4IndividualsPageInfo}
      fetchedItems={fetchedRm4Individuals}
      fetchingItems={fetchingRm4Individuals}
      errorItems={errorRm4Individuals}
      tableTitle={formatMessageWithValues(intl, MODULE, 'rm4.individuals.tableTitle', {
        count: rm4IndividualsTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={() => [['firstName', true], ['lastName', true], ['dob', true]]}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(i) => i.id}
      onDoubleClick={open}
      cacheFiltersKey="legacy_individual.Rm4IndividualsSearcher"
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingRm4Individuals: state.legacy_individual.fetchingRm4Individuals,
  fetchedRm4Individuals: state.legacy_individual.fetchedRm4Individuals,
  errorRm4Individuals: state.legacy_individual.errorRm4Individuals,
  rm4Individuals: state.legacy_individual.rm4Individuals,
  rm4IndividualsPageInfo: state.legacy_individual.rm4IndividualsPageInfo,
  rm4IndividualsTotalCount: state.legacy_individual.rm4IndividualsTotalCount,
});

export default connect(mapStateToProps, (dispatch) => bindActionCreators({ fetchRm4Individuals }, dispatch))(
  Rm4IndividualsSearcher,
);
