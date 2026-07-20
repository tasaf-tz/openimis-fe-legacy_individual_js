import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Helmet, formatMessage } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import { Fab, Tooltip } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import LegacyImportBatchesSearcher from '../components/LegacyImportBatchesSearcher';
import LegacyImportDialog from '../components/dialogs/LegacyImportDialog';
import { RIGHT_LEGACY_INDIVIDUAL_SEARCH, RIGHT_LEGACY_IMPORT_EXECUTE } from '../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page, fab: theme.fab }));

const RUNNING_STATUSES = ['PENDING', 'IN_PROGRESS'];
const POLL_INTERVAL_MS = 12000;

function LegacyImportBatchesPage() {
  const classes = useStyles();
  const intl = useIntl();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const batches = useSelector((store) => store.legacy_individual.legacyImportBatches ?? []);
  const [importOpen, setImportOpen] = useState(false);

  const [reset, setReset] = useState(0);
  const refresh = () => setReset((k) => k + 1);

  const hasRunningImport = batches.some((b) => RUNNING_STATUSES.includes(b?.status));
  useEffect(() => {
    if (!hasRunningImport) return undefined;
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasRunningImport]);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, 'legacy_individual', 'pages.imports.helmet')} />
      <LegacyArchiveBanner />
      {rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && <LegacyImportBatchesSearcher key={reset} />}

      {rights.includes(RIGHT_LEGACY_IMPORT_EXECUTE) && (
        <Tooltip title={formatMessage(intl, 'legacy_individual', 'pages.imports.fabTooltip')}>
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
        onImported={refresh}
      />
    </div>
  );
}

export default LegacyImportBatchesPage;
