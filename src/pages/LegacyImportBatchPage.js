import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Helmet } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Typography, Grid, Divider,
} from '@material-ui/core';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { fetchLegacyImportBatch } from '../actions';

const useStyles = makeStyles(() => ({
  page: { padding: 16 },
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
    <Grid item xs={12} sm={6} md={3}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value === undefined || value === null ? '—' : String(value)}</div>
    </Grid>
  );
}

function LegacyImportBatchPage({
  match,
  legacyImportBatch,
  errorLegacyImportBatch,
  fetchLegacyImportBatch,
}) {
  const classes = useStyles();
  const uuid = match?.params?.batch_uuid;

  useEffect(() => {
    if (uuid) fetchLegacyImportBatch(uuid);
  }, [uuid]);

  if (errorLegacyImportBatch) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <Typography color="error">{String(errorLegacyImportBatch.message || errorLegacyImportBatch.detail || errorLegacyImportBatch)}</Typography>
      </div>
    );
  }

  if (!legacyImportBatch) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <Typography>Loading…</Typography>
      </div>
    );
  }

  const b = legacyImportBatch;

  return (
    <div className={classes.page}>
      <Helmet title={`Legacy Import Batch — ${b.code || b.uuid}`} />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <Typography variant="h6">Batch {b.code || b.uuid}</Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Field label="Source system" value={b.sourceSystem} />
          <Field label="Status" value={b.status} />
          <Field label="Created" value={b.dateCreated} />
          <Field label="Started" value={b.startedAt} />
          <Field label="Finished" value={b.finishedAt} />
          <Field label="Household file" value={b.householdFileName} />
          <Field label="Member file" value={b.memberFileName} />
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <Typography variant="subtitle1">Counts</Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Field label="Households (read)" value={b.totalHouseholds} />
          <Field label="Households (saved)" value={b.successHouseholdCount} />
          <Field label="Members (read)" value={b.totalMembers} />
          <Field label="Members (saved)" value={b.successMemberCount} />
          <Field label="Warnings" value={b.warningCount} />
          <Field label="Errors" value={b.errorCount} />
        </Grid>
      </Paper>

      {(b.errorCount > 0 || b.warningCount > 0) && (
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">Errors and warnings</Typography>
          <Divider className={classes.divider} />
          <div className={classes.json}>{JSON.stringify(b.error || {}, null, 2)}</div>
        </Paper>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  legacyImportBatch: state.legacy_individual.legacyImportBatch,
  errorLegacyImportBatch: state.legacy_individual.errorLegacyImportBatch,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLegacyImportBatch }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyImportBatchPage);
