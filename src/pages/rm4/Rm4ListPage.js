import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import { Helmet, formatMessage } from '@openimis/fe-core';

import LegacyArchiveBanner from '../../components/LegacyArchiveBanner';
import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE } from '../../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function Rm4ListPage({ helmet, right, children }) {
  const classes = useStyles();
  const intl = useIntl();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, MODULE, helmet)} />
      <LegacyArchiveBanner message={formatMessage(intl, MODULE, 'rm4.banner')} />
      {rights.includes(right) && children}
    </div>
  );
}

export default Rm4ListPage;
