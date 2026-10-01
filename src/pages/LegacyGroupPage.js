import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Helmet, ProgressOrError, Table, TextInput, formatMessage, formatMessageWithValues, historyPush,
  useHistory, useModulesManager,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Divider, Grid, IconButton, Paper, Tooltip, Typography,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { RIGHT_LEGACY_INDIVIDUAL_SEARCH } from '../constants';
import { fetchLegacyGroup, fetchLegacyGroupIndividuals } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  header: {
    ...theme.paper.header,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  headerTitle: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
  subtitle: { color: theme.palette.text.secondary },
  item: theme.paper.item,
  tableTitle: theme.table.title,
  json: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    background: '#f7f7f7',
    padding: theme.spacing(1),
    margin: theme.spacing(2),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}));

function parseJsonExt(value) {
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

const MODULE = 'legacy_individual';
const fullName = (p) => [p?.firstName, p?.middleName, p?.lastName].filter(Boolean).join(' ');

function LegacyGroupPage({
  match,
  legacyGroup,
  legacyGroupIndividuals,
  fetchingMembers,
  rights,
  fetchLegacyGroup,
  fetchLegacyGroupIndividuals,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const uuid = match?.params?.legacy_group_uuid;
  const t = (id) => formatMessage(intl, MODULE, id);

  useEffect(() => {
    if (uuid) {
      fetchLegacyGroup(uuid);
      fetchLegacyGroupIndividuals([`group_Id: "${uuid}"`, 'first: 100']);
    }
  }, [uuid]);

  if (!legacyGroup) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <ProgressOrError progress />
      </div>
    );
  }

  const g = legacyGroup;
  const ext = parseJsonExt(g.jsonExt);
  const head = ext.head || {};
  const headName = [head.first_name, head.middle_name, head.last_name].filter(Boolean).join(' ');
  const back = () => (history.length > 1
    ? history.goBack()
    : historyPush(modulesManager, history, 'legacy_individual.route.groups'));
  const openMember = rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH)
    ? (m) => m?.individual?.uuid && historyPush(
      modulesManager, history, 'legacy_individual.route.individual', [m.individual.uuid],
    )
    : null;

  const field = (label, value) => (
    <Grid item xs={12} sm={6} md={3} className={classes.item}>
      <TextInput module={MODULE} label={label} value={value ?? ''} readOnly />
    </Grid>
  );

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(intl, MODULE, 'groupPage.helmet', { code: g.code })} />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            <Tooltip title={t('individualPage.back')}>
              <IconButton onClick={back}><ChevronLeftIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6">
              {formatMessageWithValues(intl, MODULE, 'groupPage.title', { code: g.code })}
            </Typography>
            {!!headName && (
              <Typography variant="body2" className={classes.subtitle}>
                {formatMessageWithValues(intl, MODULE, 'groupPage.head', { name: headName })}
              </Typography>
            )}
          </div>
        </div>
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.tableTitle}>{t('groupPage.detailsSection')}</Typography>
        <Divider />
        <Grid container className={classes.item}>
          {field(t('common.village'), g.location?.name)}
          {field(t('common.villageCode'), g.location?.code)}
          {field(t('groupPage.hhSize'), ext.hh_size)}
          {field(t('groupPage.hhStatus'), ext.hh_status)}
          {field(t('common.pmtScore'), ext.pmt_score)}
          {field(t('common.hhClassification'), ext.hh_classification)}
          {field(t('groupPage.phone'), ext.phone_no)}
          {field(t('groupPage.wave'), ext.wave_no)}
          {field(t('common.importBatch'), g.importBatch?.code || g.importBatch?.uuid)}
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <Table
          module={MODULE}
          header={formatMessageWithValues(intl, MODULE, 'groupPage.membersTitle', {
            count: (legacyGroupIndividuals || []).length,
          })}
          headers={[
            'groupPage.member.line', 'groupPage.member.name', 'groupPage.member.role',
            'groupPage.member.gender', 'groupPage.member.dob', 'groupPage.member.nin',
            'groupPage.member.premno', 'groupPage.member.recipient',
          ]}
          itemFormatters={[
            (m) => m.memberLine,
            (m) => fullName(m.individual),
            (m) => m.role,
            (m) => m.individual?.gender,
            (m) => m.individual?.dob,
            (m) => m.individual?.nin,
            (m) => m.individual?.premno,
            (m) => m.recipientType || '',
          ]}
          items={legacyGroupIndividuals || []}
          fetching={fetchingMembers}
          onDoubleClick={openMember}
        />
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.tableTitle}>{t('groupPage.rawPayload')}</Typography>
        <Divider />
        <div className={classes.json}>{JSON.stringify(ext, null, 2)}</div>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  legacyGroup: state.legacy_individual.legacyGroup,
  legacyGroupIndividuals: state.legacy_individual.legacyGroupIndividuals,
  fetchingMembers: state.legacy_individual.fetchingLegacyGroupIndividuals,
  rights: state.core?.user?.i_user?.rights ?? [],
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  { fetchLegacyGroup, fetchLegacyGroupIndividuals }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyGroupPage);
