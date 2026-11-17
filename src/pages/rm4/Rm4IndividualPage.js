import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { Link } from '@material-ui/core';
import {
  formatMessage, formatMessageWithValues, historyPush, useHistory, useModulesManager,
} from '@openimis/fe-core';

import { fetchRm4Individual } from '../../actions';
import Rm4AnswersPanel from '../../components/rm4/Rm4AnswersPanel';
import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE, RIGHT_RM4_GROUP_SEARCH } from '../../constants';
import { householdOf, parseJsonExt } from '../../utils/rm4';
import Rm4DetailShell from './Rm4DetailShell';

function Rm4IndividualPage({
  match, rm4Individual, errorRm4Individual, rights, fetchRm4Individual,
}) {
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const uuid = match?.params?.rm4_individual_uuid;
  const t = (id) => formatMessage(intl, MODULE, id);

  useEffect(() => { if (uuid) fetchRm4Individual(uuid); }, [uuid]);

  const person = rm4Individual?.uuid === uuid ? rm4Individual : null;
  const ext = parseJsonExt(person?.jsonExt);
  const household = householdOf(person);
  const name = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
  const householdLink = household && rights.includes(RIGHT_RM4_GROUP_SEARCH) ? (
    <Link
      component="button"
      onClick={() => historyPush(modulesManager, history, 'legacy_individual.route.rm4_group', [household.uuid])}
    >
      {household.code}
    </Link>
  ) : household?.code;

  return (
    <Rm4DetailShell
      loaded={!!person}
      error={errorRm4Individual}
      helmet={formatMessageWithValues(intl, MODULE, 'rm4.individual.helmet', { name })}
      title={name}
      backRoute="legacy_individual.route.rm4_individuals"
      fields={[
        [t('rm4.individual.dob'), person?.dob],
        [t('rm4.individual.role'), ext.individual_role],
        [t('rm4.individual.externalId'), ext.external_id],
        [t('rm4.common.village'), person?.location?.name],
        [t('rm4.individual.household'), householdLink],
      ]}
    >
      <Rm4AnswersPanel jsonExt={ext} />
    </Rm4DetailShell>
  );
}

const mapStateToProps = (state) => ({
  rm4Individual: state.legacy_individual.rm4Individual,
  errorRm4Individual: state.legacy_individual.errorRm4Individual,
  rights: state.core?.user?.i_user?.rights ?? [],
});

export default connect(mapStateToProps, (dispatch) => bindActionCreators({ fetchRm4Individual }, dispatch))(
  Rm4IndividualPage,
);
