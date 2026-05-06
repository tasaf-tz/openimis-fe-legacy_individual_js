import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import LegacyIndividualsSearcher from '../components/LegacyIndividualsSearcher';
import { RIGHT_LEGACY_INDIVIDUAL_SEARCH } from '../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function LegacyIndividualsPage() {
  const classes = useStyles();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  return (
    <div className={classes.page}>
      <Helmet title="Legacy Individuals (PSSN Archive)" />
      <LegacyArchiveBanner />
      {rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH) && <LegacyIndividualsSearcher />}
    </div>
  );
}

export default LegacyIndividualsPage;
