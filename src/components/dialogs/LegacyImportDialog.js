import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, LinearProgress, Box, Tabs, Tab,
  FormControlLabel, Checkbox, Grid,
} from '@material-ui/core';
import { PublishedComponent, useHistory, useModulesManager } from '@openimis/fe-core';

import { uploadLegacyPssnPair, pullLegacyPssnApi } from '../../actions';

const ACCEPTED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/octet-stream',
  '',
];

function LegacyImportDialog({
  open,
  onClose,
  uploadingLegacyPssn,
  legacyPssnUploadError,
  uploadLegacyPssnPair,
  pullingLegacyApi,
  legacyApiPullError,
  pullLegacyPssnApi,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
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
  };
  const close = () => {
    resetAll();
    onClose?.();
  };

  const validateCsv = (file) => {
    if (!file) return 'Required';
    if (!file.name.toLowerCase().endsWith('.csv')) return 'Must be a .csv file';
    if (file.type && !ACCEPTED_MIME.includes(file.type)) return `Unexpected MIME type: ${file.type}`;
    return null;
  };

  const submitCsv = async () => {
    setLocalError(null);
    setStartedMsg(null);
    const e1 = validateCsv(householdFile);
    if (e1) { setLocalError(`Household file: ${e1}`); return; }
    const e2 = validateCsv(memberFile);
    if (e2) { setLocalError(`Member file: ${e2}`); return; }

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
    if (!district) { setLocalError('Select a district / PAA'); return; }
    const result = await pullLegacyPssnApi({
      districtCode: district.code,
      regionCode: region?.code,
      paaName: district.name,
      dryRun,
    });
    if (result?.success) setStartedMsg(result.data?.message || 'Import started.');
  };

  const handleSubmit = () => (tab === 0 ? submitCsv() : submitApi());

  const submitLabel = tab === 0 ? 'Upload' : (dryRun ? 'Dry Run' : 'Start Import');
  const submitDisabled = busy || (tab === 0 ? (!householdFile || !memberFile) : !district);

  return (
    <Dialog open={!!open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Import legacy PSSN data</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(e, v) => { setTab(v); setLocalError(null); setStartedMsg(null); }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Upload CSV files" />
          <Tab label="Import from API" />
        </Tabs>

        <Box mt={2}>
          {tab === 0 && (
            <>
              <Typography variant="body2" gutterBottom>
                Upload the two PSSN CSVs together (household + member). Archived under a new
                legacy import batch; never written to live TASAF tables.
              </Typography>
              <Box my={2}>
                <Typography variant="subtitle2">Household file</Typography>
                <input type="file" accept=".csv" onChange={(e) => setHouseholdFile(e.target.files?.[0] || null)} />
                {householdFile && <Typography variant="caption">{householdFile.name}</Typography>}
              </Box>
              <Box my={2}>
                <Typography variant="subtitle2">Member file</Typography>
                <input type="file" accept=".csv" onChange={(e) => setMemberFile(e.target.files?.[0] || null)} />
                {memberFile && <Typography variant="caption">{memberFile.name}</Typography>}
              </Box>
              <Box my={2}>
                <TextField label="Batch code (optional)" value={code} fullWidth onChange={(e) => setCode(e.target.value)} />
              </Box>
            </>
          )}

          {tab === 1 && (
            <>
              <Typography variant="body2" gutterBottom>
                Pull one district&apos;s households and members directly from the legacy
                tasafMIS (PSSN) API into a new legacy import batch. Large districts run in the
                background — refresh the batches list to track progress. Written only to the
                legacy archive tables, never to live TASAF tables.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={region}
                    onChange={(v) => { setRegion(v); setDistrict(null); }}
                    locationLevel={0}
                    label="Region"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    value={district}
                    onChange={(v) => setDistrict(v)}
                    parentLocation={region}
                    locationLevel={1}
                    label="District / PAA"
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
                  label="Dry run (fetch & preview only, no import)"
                />
              </Box>
            </>
          )}

          {busy && <LinearProgress />}
          {startedMsg && <Typography color="primary" variant="body2">{startedMsg}</Typography>}
          {localError && <Typography color="error" variant="body2">{localError}</Typography>}
          {tab === 0 && legacyPssnUploadError && (
            <Typography color="error" variant="body2">{String(legacyPssnUploadError)}</Typography>
          )}
          {tab === 1 && legacyApiPullError && (
            <Typography color="error" variant="body2">{String(legacyApiPullError)}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={busy}>Close</Button>
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
