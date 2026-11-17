import React from 'react';
import { useIntl } from 'react-intl';
import {
  Divider, Grid, IconButton, Paper, Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import {
  Helmet, ProgressOrError, TextInput, formatMessage, historyPush, useHistory, useModulesManager,
} from '@openimis/fe-core';

import LegacyArchiveBanner from '../../components/LegacyArchiveBanner';
import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE } from '../../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  header: {
    ...theme.paper.header, display: 'flex', alignItems: 'center', gap: theme.spacing(1),
  },
  item: theme.paper.item,
  caption: { color: theme.palette.text.secondary },
}));

function Rm4DetailShell({
  helmet, title, backRoute, fields, error, loaded, children,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const banner = <LegacyArchiveBanner message={formatMessage(intl, MODULE, 'rm4.banner')} />;
  if (!loaded) {
    return <div className={classes.page}>{banner}<ProgressOrError progress={!error} error={error} /></div>;
  }
  const back = () => (history.length > 1 ? history.goBack() : historyPush(modulesManager, history, backRoute));

  return (
    <div className={classes.page}>
      <Helmet title={helmet} />
      {banner}
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Tooltip title={formatMessage(intl, MODULE, 'individualPage.back')}>
            <IconButton onClick={back}><ChevronLeftIcon /></IconButton>
          </Tooltip>
          <Typography variant="h6">{title}</Typography>
        </div>
        <Divider />
        <Grid container className={classes.item}>
          {fields.map(([label, value]) => (
            <Grid item xs={12} sm={6} md={3} className={classes.item} key={label}>
              {React.isValidElement(value) ? (
                <>
                  <Typography variant="caption" className={classes.caption}>{label}</Typography>
                  <div>{value}</div>
                </>
              ) : <TextInput module={MODULE} label={label} value={value ?? ''} readOnly />}
            </Grid>
          ))}
        </Grid>
      </Paper>
      {children}
    </div>
  );
}

export default Rm4DetailShell;
