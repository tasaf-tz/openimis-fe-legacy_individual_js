import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Helmet } from '@openimis/fe-core';
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
  const uuid = match?.params?.legacy_individual_uuid;

  useEffect(() => {
    if (uuid) fetchLegacyIndividual(uuid);
  }, [uuid]);

  if (!legacyIndividual) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <Typography>Loading…</Typography>
      </div>
    );
  }

  const ind = legacyIndividual;
  const ext = ind.jsonExt || {};

  return (
    <div className={classes.page}>
      <Helmet title={`PSSN Individual — ${ind.firstName} ${ind.lastName}`} />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <Typography variant="h6">
          {[ind.firstName, ind.middleName, ind.lastName].filter(Boolean).join(' ')}
        </Typography>
        <Typography variant="caption">Legacy code: {ind.legacyCode}</Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Field label="Gender" value={ind.gender} />
          <Field label="Date of birth" value={ind.dob} />
          <Field label="Disability" value={ind.disability == null ? null : (ind.disability ? 'Yes' : 'No')} />
          <Field label="NIN" value={ind.nin} />
          <Field label="Prem No." value={ind.premno} />
          <Field label="Phone" value={ind.phoneNo} />
          <Field label="Village" value={ind.location?.name} />
          <Field label="Village code" value={ind.location?.code} />
          <Field label="Facility" value={ind.facility?.name} />
          <Field label="Import batch" value={ind.importBatch?.code || ind.importBatch?.uuid} />
        </Grid>
      </Paper>

      {ext.nida && Object.keys(ext.nida).length > 0 && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">NIDA verification</Typography>
          <Divider className={classes.divider} />
          <Grid container spacing={2}>
            <Field label="First name" value={ext.nida.first_name} />
            <Field label="Middle name" value={ext.nida.middle_name} />
            <Field label="Last name" value={ext.nida.last_name} />
            <Field label="DOB" value={ext.nida.dob} />
            <Field label="Expiry" value={ext.nida.expiry_date} />
            <Field label="Status" value={ext.nida.status} />
            <Field label="No-NIDA reason" value={ext.nida.no_nida_reason} />
          </Grid>
        </Paper>
      )}

      {ext.sis && Object.keys(ext.sis).length > 0 && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">School Information System</Typography>
          <Divider className={classes.divider} />
          <Grid container spacing={2}>
            <Field label="School ID" value={ext.sis.school_id} />
            <Field label="School code" value={ext.sis.school_code} />
            <Field label="SIS ID" value={ext.sis.sis_id} />
            <Field label="Grade" value={ext.sis.grade} />
            <Field label="DOB" value={ext.sis.dob} />
            <Field label="Sex" value={ext.sis.sex} />
            <Field label="Update year" value={ext.sis.update_year} />
          </Grid>
        </Paper>
      )}

      <Paper className={classes.paper}>
        <Typography variant="subtitle1">Raw payload (json_ext)</Typography>
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
