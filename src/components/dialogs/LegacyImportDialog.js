import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, LinearProgress, Box, Tabs, Tab,
  FormControlLabel, Checkbox, Grid,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  PublishedComponent, TextInput, useHistory, useModulesManager,
  formatMessage, formatMessageWithValues,
} from '@openimis/fe-core';

import { uploadLegacyPssnPair, pullLegacyPssnApi } from '../../actions';

const ACCEPTED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/octet-stream',
  '',
];

function PreviewStat({ label, value }) {
  return (
    <Grid item xs={4}>
      <Typography variant="h6" style={{ lineHeight: 1.2 }}>
        {value == null ? '—' : Number(value).toLocaleString()}
      </Typography>
      <Typography variant="caption">{label}</Typography>
    </Grid>
  );
}

function LegacyImportDialog({
  open,
  onClose,
  onImported,
  uploadingLegacyPssn,
  legacyPssnUploadError,
  uploadLegacyPssnPair,
  pullingLegacyApi,
  legacyApiPullError,
  pullLegacyPssnApi,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const [tab, setTab] = useState(0);

  // CSV tab
  const [householdFile, setHouseholdFile] = useState(null);
  const [memberFile, setMemberFile] = useState(null);
  const [code, setCode] = useState('');

  // API tab
  const [region, setRegion] = useState(null);
  const [district, setDistrict] = useState(null);
  const [dryRun, setDryRun] = useState(false);

  const [localError, setLocalError] = useState(null);
  const [startedMsg, setStartedMsg] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);

  const busy = uploadingLegacyPssn || pullingLegacyApi;

  const resetAll = () => {
    setHouseholdFile(null);
    setMemberFile(null);
    setCode('');
    setRegion(null);
    setDistrict(null);
    setDryRun(false);
    setLocalError(null);
    setStartedMsg(null);
    setDryRunResult(null);
  };
  const close = () => {
    resetAll();
    onClose?.();
  };

  const validateCsv = (file) => {
    if (!file) return formatMessage(intl, 'legacy_individual', 'dialog.error.required');
    if (!file.name.toLowerCase().endsWith('.csv')) return formatMessage(intl, 'legacy_individual', 'dialog.error.mustBeCsv');
    if (file.type && !ACCEPTED_MIME.includes(file.type)) {
      return formatMessageWithValues(intl, 'legacy_individual', 'dialog.error.unexpectedMime', { type: file.type });
    }
    return null;
  };

  const submitCsv = async () => {
    setLocalError(null);
    setStartedMsg(null);
    const e1 = validateCsv(householdFile);
    if (e1) { setLocalError(formatMessageWithValues(intl, 'legacy_individual', 'dialog.error.householdFilePrefix', { msg: e1 })); return; }
    const e2 = validateCsv(memberFile);
    if (e2) { setLocalError(formatMessageWithValues(intl, 'legacy_individual', 'dialog.error.memberFilePrefix', { msg: e2 })); return; }

    const result = await uploadLegacyPssnPair({ householdFile, memberFile, code: code || undefined });
    if (result?.success && result.data?.batch_uuid) {
      const batchUuid = result.data.batch_uuid;
      close();
      history.push(`/${modulesManager.getRef('legacy_individual.route.import_batch')}/${batchUuid}`);
    }
  };

  const submitApi = async () => {
    setLocalError(null);
    setStartedMsg(null);
    setDryRunResult(null);
    if (!district) { setLocalError(formatMessage(intl, 'legacy_individual', 'dialog.error.selectDistrict')); return; }
    const result = await pullLegacyPssnApi({
      districtCode: district.code,
      regionCode: region?.code,
      paaName: district.name,
      dryRun,
    });
    if (!result?.success) return;
    if (dryRun) {
      setDryRunResult(result.data || {});
      return;
    }
    onImported?.();
    close();
  };

  const handleSubmit = () => (tab === 0 ? submitCsv() : submitApi());

  const submitLabel = tab === 0
    ? formatMessage(intl, 'legacy_individual', 'dialog.upload')
    : formatMessage(intl, 'legacy_individual', dryRun ? 'dialog.dryRunBtn' : 'dialog.startImport');
  const submitDisabled = busy || (tab === 0 ? (!householdFile || !memberFile) : !district);

  return (
    <Dialog open={!!open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{formatMessage(intl, 'legacy_individual', 'dialog.title')}</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(e, v) => { setTab(v); setLocalError(null); setStartedMsg(null); setDryRunResult(null); }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={formatMessage(intl, 'legacy_individual', 'dialog.tab.csv')} />
          <Tab label={formatMessage(intl, 'legacy_individual', 'dialog.tab.api')} />
        </Tabs>

        <Box mt={2}>
          {tab === 0 && (
            <>
              <Typography variant="body2" gutterBottom>
                {formatMessage(intl, 'legacy_individual', 'dialog.csv.intro')}
              </Typography>
              <Box my={2}>
                <Typography variant="subtitle2">{formatMessage(intl, 'legacy_individual', 'dialog.csv.householdFile')}</Typography>
                <input type="file" accept=".csv" onChange={(e) => setHouseholdFile(e.target.files?.[0] || null)} />
                {householdFile && <Typography variant="caption">{householdFile.name}</Typography>}
              </Box>
              <Box my={2}>
                <Typography variant="subtitle2">{formatMessage(intl, 'legacy_individual', 'dialog.csv.memberFile')}</Typography>
                <input type="file" accept=".csv" onChange={(e) => setMemberFile(e.target.files?.[0] || null)} />
                {memberFile && <Typography variant="caption">{memberFile.name}</Typography>}
              </Box>
              <Box my={2}>
                <TextInput
                  module="legacy_individual"
                  label="dialog.csv.batchCode"
                  value={code}
                  onChange={(v) => setCode(v)}
                />
              </Box>
            </>
          )}

          {tab === 1 && (
            <>
              <Typography variant="body2" gutterBottom>
                {formatMessage(intl, 'legacy_individual', 'dialog.api.intro')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={region}
                    onChange={(v) => { setRegion(v); setDistrict(null); }}
                    locationLevel={0}
                    label={formatMessage(intl, 'legacy_individual', 'dialog.api.region')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={district}
                    onChange={(v) => setDistrict(v)}
                    parentLocation={region}
                    locationLevel={1}
                    label={formatMessage(intl, 'legacy_individual', 'dialog.api.district')}
                  />
                </Grid>
              </Grid>
              <Box mt={2}>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      color="primary"
                    />
                  )}
                  label={formatMessage(intl, 'legacy_individual', 'dialog.api.dryRun')}
                />
              </Box>
            </>
          )}

          {busy && <LinearProgress />}
          {startedMsg && <Box mt={2}><Alert severity="success">{startedMsg}</Alert></Box>}
          {tab === 1 && dryRunResult && (
            <Box mt={2}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  {formatMessage(intl, 'legacy_individual', 'dialog.dryRunPreview.title')}
                </Typography>
                <Grid container spacing={2}>
                  <PreviewStat
                    label={formatMessage(intl, 'legacy_individual', 'dialog.dryRunPreview.rawRows')}
                    value={dryRunResult.raw_rows}
                  />
                  <PreviewStat
                    label={formatMessage(intl, 'legacy_individual', 'dialog.dryRunPreview.households')}
                    value={dryRunResult.stats?.total_households}
                  />
                  <PreviewStat
                    label={formatMessage(intl, 'legacy_individual', 'dialog.dryRunPreview.members')}
                    value={dryRunResult.stats?.total_members}
                  />
                </Grid>
                <Typography variant="caption" component="p" style={{ marginTop: 8 }}>
                  {formatMessage(intl, 'legacy_individual', 'dialog.dryRunPreview.note')}
                </Typography>
              </Alert>
            </Box>
          )}
          {localError && <Box mt={2}><Alert severity="error">{localError}</Alert></Box>}
          {tab === 0 && legacyPssnUploadError && (
            <Box mt={2}><Alert severity="error">{String(legacyPssnUploadError)}</Alert></Box>
          )}
          {tab === 1 && legacyApiPullError && (
            <Box mt={2}><Alert severity="error">{String(legacyApiPullError)}</Alert></Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={busy}>{formatMessage(intl, 'legacy_individual', 'dialog.close')}</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={submitDisabled}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  uploadingLegacyPssn: state.legacy_individual.uploadingLegacyPssn,
  legacyPssnUploadError: state.legacy_individual.legacyPssnUploadError,
  pullingLegacyApi: state.legacy_individual.pullingLegacyApi,
  legacyApiPullError: state.legacy_individual.legacyApiPullError,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  { uploadLegacyPssnPair, pullLegacyPssnApi }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyImportDialog);
