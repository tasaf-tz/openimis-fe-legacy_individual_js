import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  Searcher, decodeId, formatMessage, formatMessageWithValues, useHistory, useModulesManager,
} from '@openimis/fe-core';

import { fetchRm4Groups } from '../../actions';
import { DEFAULT_PAGE_SIZE, LEGACY_INDIVIDUAL_MODULE_NAME as MODULE, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { districtOf, parseJsonExt } from '../../utils/rm4';
import Rm4GroupsFilter from './Rm4GroupsFilter';

function Rm4GroupsSearcher({
  fetchRm4Groups, fetchingRm4Groups, fetchedRm4Groups, errorRm4Groups, rm4Groups, rm4GroupsPageInfo,
  rm4GroupsTotalCount,
}) {
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const t = (id) => formatMessage(intl, MODULE, id);

  const open = (g) => history.push(`/${modulesManager.getRef('legacy_individual.route.rm4_group')}/${decodeId(g.id)}`);

  const headers = () => [
    'rm4.group.code', 'rm4.group.head', 'rm4.group.interviewKey', 'rm4.common.village', 'rm4.common.district',
    'rm4.group.pmtScore', 'rm4.group.pmtClass', '',
  ].map((id) => (id ? t(id) : ''));

  const itemFormatters = () => [
    (g) => g.code,
    (g) => parseJsonExt(g.jsonExt).head ?? '',
    (g) => parseJsonExt(g.jsonExt).interview_key ?? '',
    (g) => g.location?.name ?? '',
    (g) => districtOf(g.location),
    (g) => parseJsonExt(g.jsonExt).pmt_score_household ?? '',
    (g) => parseJsonExt(g.jsonExt).pmt_class_household ?? '',
    (g) => (
      <Tooltip title={t('common.viewDetail')}>
        <IconButton onClick={() => open(g)}><VisibilityIcon /></IconButton>
      </Tooltip>
    ),
  ];

  return (
    <Searcher
      module={MODULE}
      FilterPane={Rm4GroupsFilter}
      fetch={fetchRm4Groups}
      items={rm4Groups}
      itemsPageInfo={rm4GroupsPageInfo}
      fetchedItems={fetchedRm4Groups}
      fetchingItems={fetchingRm4Groups}
      errorItems={errorRm4Groups}
      tableTitle={formatMessageWithValues(intl, MODULE, 'rm4.groups.tableTitle', { count: rm4GroupsTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={() => [['code', true]]}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      rowIdentifier={(g) => g.id}
      onDoubleClick={open}
      cacheFiltersKey="legacy_individual.Rm4GroupsSearcher"
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingRm4Groups: state.legacy_individual.fetchingRm4Groups,
  fetchedRm4Groups: state.legacy_individual.fetchedRm4Groups,
  errorRm4Groups: state.legacy_individual.errorRm4Groups,
  rm4Groups: state.legacy_individual.rm4Groups,
  rm4GroupsPageInfo: state.legacy_individual.rm4GroupsPageInfo,
  rm4GroupsTotalCount: state.legacy_individual.rm4GroupsTotalCount,
});

export default connect(mapStateToProps, (dispatch) => bindActionCreators({ fetchRm4Groups }, dispatch))(
  Rm4GroupsSearcher,
);
