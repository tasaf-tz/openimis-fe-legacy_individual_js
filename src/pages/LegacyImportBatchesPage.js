import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import { Fab, Tooltip } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import LegacyImportBatchesSearcher from '../components/LegacyImportBatchesSearcher';
import LegacyImportDialog from '../components/dialogs/LegacyImportDialog';
import { RIGHT_LEGACY_INDIVIDUAL_SEARCH, RIGHT_LEGACY_IMPORT_EXECUTE } from '../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page, fab: theme.fab }));

function LegacyImportBatchesPage() {
  const classes = useStyles();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className={classes.page}>
      <Helmet title="Legacy Imports (PSSN)" />
      <LegacyArchiveBanner />
      {rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && <LegacyImportBatchesSearcher />}

      {rights.includes(RIGHT_LEGACY_IMPORT_EXECUTE) && (
        <Tooltip title="Import legacy PSSN data (CSV upload or API)">
          <div className={classes.fab}>
            <Fab color="primary" onClick={() => setImportOpen(true)}>
              <CloudUploadIcon />
            </Fab>
          </div>
        </Tooltip>
      )}

      <LegacyImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}

export default LegacyImportBatchesPage;
