import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { Helmet, formatMessage, formatMessageWithValues } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import {
  Paper, Typography, Grid, Divider, Table, TableBody, TableCell, TableHead, TableRow,
} from '@material-ui/core';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import { fetchLegacyGroup, fetchLegacyGroupIndividuals } from '../actions';

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
    <Grid item xs={12} sm={6} md={4}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value || '—'}</div>
    </Grid>
  );
}

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

function LegacyGroupPage({
  match,
  legacyGroup,
  legacyGroupIndividuals,
  fetchLegacyGroup,
  fetchLegacyGroupIndividuals,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const uuid = match?.params?.legacy_group_uuid;

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
        <Typography>{formatMessage(intl, 'legacy_individual', 'common.loading')}</Typography>
      </div>
    );
  }

  const g = legacyGroup;
  const ext = parseJsonExt(g.jsonExt);
  const head = ext.head || {};

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(intl, 'legacy_individual', 'groupPage.helmet', { code: g.code })} />
      <LegacyArchiveBanner />

      <Paper className={classes.paper}>
        <Typography variant="h6">{formatMessageWithValues(intl, 'legacy_individual', 'groupPage.title', { code: g.code })}</Typography>
        <Typography variant="caption">
          {formatMessageWithValues(intl, 'legacy_individual', 'groupPage.head', {
            name: [head.first_name, head.middle_name, head.last_name].filter(Boolean).join(' '),
          })}
        </Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Field label={formatMessage(intl, 'legacy_individual', 'common.village')} value={g.location?.name} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.villageCode')} value={g.location?.code} />
          <Field label={formatMessage(intl, 'legacy_individual', 'groupPage.hhSize')} value={ext.hh_size} />
          <Field label={formatMessage(intl, 'legacy_individual', 'groupPage.hhStatus')} value={ext.hh_status} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.pmtScore')} value={ext.pmt_score} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.hhClassification')} value={ext.hh_classification} />
          <Field label={formatMessage(intl, 'legacy_individual', 'groupPage.phone')} value={ext.phone_no} />
          <Field label={formatMessage(intl, 'legacy_individual', 'groupPage.wave')} value={ext.wave_no} />
          <Field label={formatMessage(intl, 'legacy_individual', 'common.importBatch')} value={g.importBatch?.code || g.importBatch?.uuid} />
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <Typography variant="subtitle1">{formatMessage(intl, 'legacy_individual', 'groupPage.membersSection')}</Typography>
        <Divider className={classes.divider} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.line')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.name')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.role')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.gender')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.dob')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.nin')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.premno')}</TableCell>
              <TableCell>{formatMessage(intl, 'legacy_individual', 'groupPage.member.recipient')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(legacyGroupIndividuals || []).map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.memberLine}</TableCell>
                <TableCell>
                  {[m.individual?.firstName, m.individual?.middleName, m.individual?.lastName]
                    .filter(Boolean).join(' ')}
                </TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>{m.individual?.gender}</TableCell>
                <TableCell>{m.individual?.dob}</TableCell>
                <TableCell>{m.individual?.nin}</TableCell>
                <TableCell>{m.individual?.premno}</TableCell>
                <TableCell>{m.recipientType || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper className={classes.paper}>
        <Typography variant="subtitle1">{formatMessage(intl, 'legacy_individual', 'groupPage.rawPayload')}</Typography>
        <Divider className={classes.divider} />
        <div className={classes.json}>{JSON.stringify(ext, null, 2)}</div>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  legacyGroup: state.legacy_individual.legacyGroup,
  legacyGroupIndividuals: state.legacy_individual.legacyGroupIndividuals,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  { fetchLegacyGroup, fetchLegacyGroupIndividuals }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyGroupPage);
