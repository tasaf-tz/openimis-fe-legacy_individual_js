import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Helmet, ProgressOrError, TextInput, formatMessage, formatMessageWithValues, historyPush,
  useHistory, useModulesManager,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Avatar, Divider, Grid, IconButton, Paper, Tooltip, Typography,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { fetchLegacyIndividual } from '../actions';

const MODULE = 'legacy_individual';

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
  code: { color: theme.palette.text.secondary },
  item: theme.paper.item,
  tableTitle: theme.table.title,
  bigAvatar: theme.bigAvatar,
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

function LegacyIndividualPage({
  match,
  legacyIndividual,
  fetchLegacyIndividual,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const uuid = match?.params?.legacy_individual_uuid;
  const t = (id) => formatMessage(intl, MODULE, id);

  useEffect(() => {
    if (uuid) fetchLegacyIndividual(uuid);
  }, [uuid]);

  const field = (label, value) => (
    <Grid item xs={12} sm={6} md={3} className={classes.item}>
      <TextInput module={MODULE} label={label} value={value ?? ''} readOnly />
    </Grid>
  );

  const section = (title, children) => (
    <Paper className={classes.paper}>
      <Typography className={classes.tableTitle}>{title}</Typography>
      <Divider />
      {children}
    </Paper>
  );

  const ind = legacyIndividual;
  if (!ind) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <ProgressOrError progress />
      </div>
    );
  }

  const ext = ind.jsonExt || {};
  const fullName = [ind.firstName, ind.middleName, ind.lastName].filter(Boolean).join(' ');
  const back = () => (history.length > 1
    ? history.goBack()
    : historyPush(modulesManager, history, 'legacy_individual.route.individuals'));

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(intl, MODULE, 'individualPage.helmet', {
        name: `${ind.firstName} ${ind.lastName}`,
      })}
      />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            <Tooltip title={t('individualPage.back')}>
              <IconButton onClick={back}><ChevronLeftIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6">{fullName}</Typography>
            {!!ind.legacyCode && (
              <Typography variant="body2" className={classes.code}>
                {formatMessageWithValues(intl, MODULE, 'individualPage.legacyCode', { code: ind.legacyCode })}
              </Typography>
            )}
          </div>
        </div>
      </Paper>

      {section(t('individualPage.personalDetails'), (
        <Grid container className={classes.item}>
          <Grid item xs={12} sm={3} md={2} className={classes.item}>
            <Avatar className={classes.bigAvatar} />
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Grid container>
              {field(t('common.gender'), ind.gender)}
              {field(t('common.dob'), ind.dob)}
              {field(
                t('individualPage.disability'),
                ind.disability == null ? null
                  : t(ind.disability ? 'individualPage.disabilityYes' : 'individualPage.disabilityNo'),
              )}
              {field(t('common.nin'), ind.nin)}
              {field(t('common.premno'), ind.premno)}
              {field(t('common.phone'), ind.phoneNo)}
              {field(t('common.village'), ind.location?.name)}
              {field(t('common.villageCode'), ind.location?.code)}
              {field(t('individualPage.facility'), ind.facility?.name)}
              {field(t('common.importBatch'), ind.importBatch?.code || ind.importBatch?.uuid)}
            </Grid>
          </Grid>
        </Grid>
      ))}

      {ext.nida && Object.keys(ext.nida).length > 0 && section(t('individualPage.nidaSection'), (
        <Grid container className={classes.item}>
          {field(t('individualPage.nida.firstName'), ext.nida.first_name)}
          {field(t('individualPage.nida.middleName'), ext.nida.middle_name)}
          {field(t('individualPage.nida.lastName'), ext.nida.last_name)}
          {field(t('individualPage.nida.dob'), ext.nida.dob)}
          {field(t('individualPage.nida.expiry'), ext.nida.expiry_date)}
          {field(t('individualPage.nida.status'), ext.nida.status)}
          {field(t('individualPage.nida.noNidaReason'), ext.nida.no_nida_reason)}
        </Grid>
      ))}

      {ext.sis && Object.keys(ext.sis).length > 0 && section(t('individualPage.sisSection'), (
        <Grid container className={classes.item}>
          {field(t('individualPage.sis.schoolId'), ext.sis.school_id)}
          {field(t('individualPage.sis.schoolCode'), ext.sis.school_code)}
          {field(t('individualPage.sis.sisId'), ext.sis.sis_id)}
          {field(t('individualPage.sis.grade'), ext.sis.grade)}
          {field(t('individualPage.sis.dob'), ext.sis.dob)}
          {field(t('individualPage.sis.sex'), ext.sis.sex)}
          {field(t('individualPage.sis.updateYear'), ext.sis.update_year)}
        </Grid>
      ))}

      {section(t('individualPage.rawPayload'), (
        <div className={classes.json}>{JSON.stringify(ext, null, 2)}</div>
      ))}
    </div>
  );
}

const mapStateToProps = (state) => ({
  legacyIndividual: state.legacy_individual.legacyIndividual,
  fetching: state.legacy_individual.fetchingLegacyIndividual,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyIndividual }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyIndividualPage);
