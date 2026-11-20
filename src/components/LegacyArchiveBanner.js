import React from 'react';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { formatMessage } from '@openimis/fe-core';

const useStyles = makeStyles((theme) => ({
  banner: {
    backgroundColor: fade(theme.palette.warning.main, 0.08),
    color: theme.palette.text.primary,
    padding: '8px 16px',
    margin: '0 0 12px 0',
    border: `1px solid ${fade(theme.palette.warning.main, 0.35)}`,
    borderRadius: 4,
    fontSize: '0.9rem',
  },
}));

function LegacyArchiveBanner({ message }) {
  const classes = useStyles();
  const intl = useIntl();
  return (
    <Paper elevation={0} className={classes.banner}>
      {message || formatMessage(intl, 'legacy_individual', 'banner.default')}
    </Paper>
  );
}

export default LegacyArchiveBanner;
