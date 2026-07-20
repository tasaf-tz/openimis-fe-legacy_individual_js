import React from 'react';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import { Paper } from '@material-ui/core';
import { formatMessage } from '@openimis/fe-core';

const useStyles = makeStyles((theme) => ({
  banner: {
    backgroundColor: '#f5f0e6',
    color: '#5a4a32',
    padding: '8px 16px',
    margin: '0 0 12px 0',
    borderLeft: '4px solid #b89b6a',
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
