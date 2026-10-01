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
  Chip, Divider, Grid, IconButton, Paper, Tooltip, Typography,
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { fetchLegacyImportBatch } from '../actions';

const MODULE = 'legacy_individual';
const STATUS_CHIP_COLOR = '#9e9e9e';

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
  status: { background: STATUS_CHIP_COLOR, color: '#fff', fontWeight: 600 },
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

const when = (iso) => (iso ? String(iso).slice(0, 19).replace('T', ' ') : '');
const shown = (value) => (value === undefined || value === null ? '' : String(value));

function LegacyImportBatchPage({
  match,
  legacyImportBatch,
  errorLegacyImportBatch,
  fetchLegacyImportBatch,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const uuid = match?.params?.batch_uuid;
  const t = (id) => formatMessage(intl, MODULE, id);

  useEffect(() => {
    if (uuid) fetchLegacyImportBatch(uuid);
  }, [uuid]);

  if (errorLegacyImportBatch || !legacyImportBatch) {
    return (
      <div className={classes.page}>
        <LegacyArchiveBanner />
        <ProgressOrError progress={!errorLegacyImportBatch} error={errorLegacyImportBatch} />
      </div>
    );
  }

  const b = legacyImportBatch;
  const back = () => (history.length > 1
    ? history.goBack()
    : historyPush(modulesManager, history, 'legacy_individual.route.imports'));

  const field = (label, value) => (
    <Grid item xs={12} sm={6} md={3} className={classes.item}>
      <TextInput module={MODULE} label={label} value={shown(value)} readOnly />
    </Grid>
  );

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(intl, MODULE, 'batchPage.helmet', { code: b.code || b.uuid })} />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            <Tooltip title={t('individualPage.back')}>
              <IconButton onClick={back}><ChevronLeftIcon /></IconButton>
            </Tooltip>
            <Typography variant="h6">
              {formatMessageWithValues(intl, MODULE, 'batchPage.title', { code: b.code || b.uuid })}
            </Typography>
            {!!b.status && <Chip size="small" label={b.status} className={classes.status} />}
          </div>
        </div>
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.tableTitle}>{t('batchPage.detailsSection')}</Typography>
        <Divider />
        <Grid container className={classes.item}>
          {field(t('batchPage.sourceSystem'), b.sourceSystem)}
          {field(t('batchPage.status'), b.status)}
          {field(t('batchPage.created'), when(b.dateCreated))}
          {field(t('batchPage.started'), when(b.startedAt))}
          {field(t('batchPage.finished'), when(b.finishedAt))}
          {field(t('batchPage.householdFile'), b.householdFileName)}
          {field(t('batchPage.memberFile'), b.memberFileName)}
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.tableTitle}>{t('batchPage.countsSection')}</Typography>
        <Divider />
        <Grid container className={classes.item}>
          {field(t('batchPage.households_read'), b.totalHouseholds)}
          {field(t('batchPage.households_saved'), b.successHouseholdCount)}
          {field(t('batchPage.members_read'), b.totalMembers)}
          {field(t('batchPage.members_saved'), b.successMemberCount)}
          {field(t('batchPage.warnings'), b.warningCount)}
          {field(t('batchPage.errors'), b.errorCount)}
        </Grid>
      </Paper>

      {(b.errorCount > 0 || b.warningCount > 0) && (
        <Paper className={classes.paper}>
          <Typography className={classes.tableTitle}>{t('batchPage.errorsSection')}</Typography>
          <Divider />
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
