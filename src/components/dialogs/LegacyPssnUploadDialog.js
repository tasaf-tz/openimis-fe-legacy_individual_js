import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, LinearProgress, Box,
} from '@material-ui/core';
import { useHistory, useModulesManager } from '@openimis/fe-core';

import { uploadLegacyPssnPair } from '../../actions';

const ACCEPTED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/octet-stream',
  '',  // some browsers leave .csv with empty MIME
];

function LegacyPssnUploadDialog({
  open,
  onClose,
  uploadingLegacyPssn,
  legacyPssnUploadError,
  uploadLegacyPssnPair,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const [householdFile, setHouseholdFile] = useState(null);
  const [memberFile, setMemberFile] = useState(null);
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState(null);

  const validate = (file) => {
    if (!file) return 'Required';
    if (!file.name.toLowerCase().endsWith('.csv')) return 'Must be a .csv file';
    if (file.type && !ACCEPTED_MIME.includes(file.type)) {
      return `Unexpected MIME type: ${file.type}`;
    }
    return null;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    const e1 = validate(householdFile);
    if (e1) { setLocalError(`Household file: ${e1}`); return; }
    const e2 = validate(memberFile);
    if (e2) { setLocalError(`Member file: ${e2}`); return; }

    const result = await uploadLegacyPssnPair({
      householdFile, memberFile, code: code || undefined,
    });
    if (result?.success && result.data?.batch_uuid) {
      const batchUuid = result.data.batch_uuid;
      onClose?.();
      history.push(`/${modulesManager.getRef('legacy_individual.route.import_batch')}/${batchUuid}`);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload PSSN paired CSV files</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Upload the two PSSN CSVs together (household + member). They will be
          archived under a new legacy import batch and never written to live
          TASAF tables.
        </Typography>

        <Box my={2}>
          <Typography variant="subtitle2">Household file</Typography>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setHouseholdFile(e.target.files?.[0] || null)}
          />
          {householdFile && (
            <Typography variant="caption">{householdFile.name}</Typography>
          )}
        </Box>

        <Box my={2}>
          <Typography variant="subtitle2">Member file</Typography>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setMemberFile(e.target.files?.[0] || null)}
          />
          {memberFile && (
            <Typography variant="caption">{memberFile.name}</Typography>
          )}
        </Box>

        <Box my={2}>
          <TextField
            label="Batch code (optional)"
            value={code}
            fullWidth
            onChange={(e) => setCode(e.target.value)}
          />
        </Box>

        {uploadingLegacyPssn && <LinearProgress />}
        {localError && (
          <Typography color="error" variant="body2">{localError}</Typography>
        )}
        {legacyPssnUploadError && (
          <Typography color="error" variant="body2">
            {String(legacyPssnUploadError)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploadingLegacyPssn}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={uploadingLegacyPssn || !householdFile || !memberFile}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  uploadingLegacyPssn: state.legacy_individual.uploadingLegacyPssn,
  uploadedLegacyPssn: state.legacy_individual.uploadedLegacyPssn,
  legacyPssnUploadError: state.legacy_individual.legacyPssnUploadError,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ uploadLegacyPssnPair }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyPssnUploadDialog);
