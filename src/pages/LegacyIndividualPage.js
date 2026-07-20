import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { Helmet, formatMessage, formatMessageWithValues } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Typography, Grid, Divider,
} from '@material-ui/core';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { fetchLegacyIndividual } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: { padding: 16, marginBottom: 16 },
  label: { color: '#777', fontSize: '0.78rem', textTransform: 'uppercase' },
  value: { fontSize: '0.95rem' },
  divider: { margin: '12px 0' },
  json: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    background: '#f7f7f7',
    padding: 8,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}));

function Field({ label, value }) {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} md={4}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value || '—'}</div>
    </Grid>
  );
}

function LegacyIndividualPage({
  match,
  legacyIndividual,
  fetchLegacyIndividual,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const uuid = match?.params?.legacy_individual_uuid;

  useEffect(() => {
    if (uuid) fetchLegacyIndividual(uuid);
  }, [uuid]);

  if (!legacyIndividual) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <Typography>{formatMessage(intl, 'legacy_individual', 'common.loading')}</Typography>
      </div>
    );
  }

  const ind = legacyIndividual;
  const ext = ind.jsonExt || {};

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(
        intl, 'legacy_individual', 'individualPage.helmet',
        { name: `${ind.firstName} ${ind.lastName}` },
      )}
      />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <Typography variant="h6">
          {[ind.firstName, ind.middleName, ind.lastName].filter(Boolean).join(' ')}
        </Typography>
        <Typography variant="caption">
          {formatMessageWithValues(intl, 'legacy_individual', 'individualPage.legacyCode', { code: ind.legacyCode })}
        </Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Field label={formatMessage(intl, 'legacy_individual', 'common.gender')} value={ind.gender} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.dob')} value={ind.dob} />
          <Field
            label={formatMessage(intl, 'legacy_individual', 'individualPage.disability')}
            value={ind.disability == null ? null : formatMessage(intl, 'legacy_individual', ind.disability ? 'individualPage.disabilityYes' : 'individualPage.disabilityNo')}
          />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.nin')} value={ind.nin} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.premno')} value={ind.premno} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.phone')} value={ind.phoneNo} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.village')} value={ind.location?.name} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.villageCode')} value={ind.location?.code} />
          <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.facility')} value={ind.facility?.name} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.importBatch')} value={ind.importBatch?.code || ind.importBatch?.uuid} />
        </Grid>
      </Paper>

      {ext.nida && Object.keys(ext.nida).length > 0 && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">{formatMessage(intl, 'legacy_individual', 'individualPage.nidaSection')}</Typography>
          <Divider className={classes.divider} />
          <Grid container spacing={2}>
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.firstName')} value={ext.nida.first_name} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.middleName')} value={ext.nida.middle_name} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.lastName')} value={ext.nida.last_name} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.dob')} value={ext.nida.dob} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.expiry')} value={ext.nida.expiry_date} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.status')} value={ext.nida.status} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.nida.noNidaReason')} value={ext.nida.no_nida_reason} />
          </Grid>
        </Paper>
      )}

      {ext.sis && Object.keys(ext.sis).length > 0 && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">{formatMessage(intl, 'legacy_individual', 'individualPage.sisSection')}</Typography>
          <Divider className={classes.divider} />
          <Grid container spacing={2}>
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.schoolId')} value={ext.sis.school_id} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.schoolCode')} value={ext.sis.school_code} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.sisId')} value={ext.sis.sis_id} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.grade')} value={ext.sis.grade} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.dob')} value={ext.sis.dob} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.sex')} value={ext.sis.sex} />
            <Field label={formatMessage(intl, 'legacy_individual', 'individualPage.sis.updateYear')} value={ext.sis.update_year} />
          </Grid>
        </Paper>
      )}

      <Paper className={classes.paper}>
        <Typography variant="subtitle1">{formatMessage(intl, 'legacy_individual', 'individualPage.rawPayload')}</Typography>
        <Divider className={classes.divider} />
        <div className={classes.json}>{JSON.stringify(ext, null, 2)}</div>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  legacyIndividual: state.legacy_individual.legacyIndividual,
  fetching: state.legacy_individual.fetchingLegacyIndividual,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyIndividual }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyIndividualPage);
