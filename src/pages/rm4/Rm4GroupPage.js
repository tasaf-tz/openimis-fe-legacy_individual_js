import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table, formatMessage, formatMessageWithValues, historyPush, useHistory, useModulesManager,
} from '@openimis/fe-core';

import { fetchRm4Group, fetchRm4GroupIndividuals } from '../../actions';
import Rm4AnswersPanel from '../../components/rm4/Rm4AnswersPanel';
import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE, RIGHT_RM4_INDIVIDUAL_SEARCH } from '../../constants';
import { districtOf, parseJsonExt } from '../../utils/rm4';
import Rm4DetailShell from './Rm4DetailShell';

const useStyles = makeStyles((theme) => ({ paper: theme.paper.paper }));

function Rm4GroupPage({
  match, rm4Group, errorRm4Group, members, fetchingMembers, rights, fetchRm4Group, fetchRm4GroupIndividuals,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const uuid = match?.params?.rm4_group_uuid;
  const t = (id) => formatMessage(intl, MODULE, id);

  useEffect(() => {
    if (uuid) {
      fetchRm4Group(uuid);
      fetchRm4GroupIndividuals([`group_Id: "${uuid}"`, 'first: 100']);
    }
  }, [uuid]);

  const group = rm4Group?.uuid === uuid ? rm4Group : null;
  const ext = parseJsonExt(group?.jsonExt);
  const openMember = rights.includes(RIGHT_RM4_INDIVIDUAL_SEARCH)
    ? (m) => historyPush(modulesManager, history, 'legacy_individual.route.rm4_individual', [m.individual.uuid])
    : null;

  return (
    <Rm4DetailShell
      loaded={!!group}
      error={errorRm4Group}
      helmet={formatMessageWithValues(intl, MODULE, 'rm4.group.helmet', { code: group?.code })}
      title={formatMessageWithValues(intl, MODULE, 'rm4.group.title', { code: group?.code })}
      backRoute="legacy_individual.route.rm4_groups"
      fields={[
        [t('rm4.group.head'), ext.head],
        [t('rm4.group.interviewKey'), ext.interview_key],
        [t('rm4.group.wave'), ext.pssn_wave],
        [t('rm4.group.consent'), ext.consent_res],
        [t('rm4.common.village'), group?.location?.name],
        [t('rm4.common.district'), districtOf(group?.location)],
        [t('rm4.group.pmtScore'), ext.pmt_score_household],
        [t('rm4.group.pmtClass'), ext.pmt_class_household],
        [t('rm4.group.archiveBatch'), group?.archiveBatch?.code],
      ]}
    >
      <Paper className={classes.paper}>
        <Table
          module={MODULE}
          header={formatMessageWithValues(intl, MODULE, 'rm4.group.members', { count: (members || []).length })}
          headers={['rm4.individual.firstName', 'rm4.individual.lastName', 'rm4.individual.dob',
            'rm4.individual.role', 'rm4.individual.recipient']}
          itemFormatters={[
            (m) => m.individual?.firstName,
            (m) => m.individual?.lastName,
            (m) => m.individual?.dob,
            (m) => m.role,
            (m) => m.recipientType || '',
          ]}
          items={members || []}
          fetching={fetchingMembers}
          onDoubleClick={openMember}
        />
      </Paper>
      <Rm4AnswersPanel jsonExt={ext} />
    </Rm4DetailShell>
  );
}

const mapStateToProps = (state) => ({
  rm4Group: state.legacy_individual.rm4Group,
  errorRm4Group: state.legacy_individual.errorRm4Group,
  members: state.legacy_individual.rm4GroupIndividuals,
  fetchingMembers: state.legacy_individual.fetchingRm4GroupIndividuals,
  rights: state.core?.user?.i_user?.rights ?? [],
});

export default connect(
  mapStateToProps,
  (dispatch) => bindActionCreators({ fetchRm4Group, fetchRm4GroupIndividuals }, dispatch),
)(Rm4GroupPage);
