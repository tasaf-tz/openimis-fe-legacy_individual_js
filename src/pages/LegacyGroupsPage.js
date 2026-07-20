import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Helmet, formatMessage } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';

import LegacyArchiveBanner from '../components/LegacyArchiveBanner';
import LegacyGroupsSearcher from '../components/LegacyGroupsSearcher';
import { RIGHT_LEGACY_GROUP_SEARCH } from '../constants';

const useStyles = makeStyles((theme) => ({ page: theme.page }));

function LegacyGroupsPage() {
  const classes = useStyles();
  const intl = useIntl();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, 'legacy_individual', 'pages.groups.helmet')} />
      <LegacyArchiveBanner />
      {rights.includes(RIGHT_LEGACY_GROUP_SEARCH) && <LegacyGroupsSearcher />}
    </div>
  );
}

export default LegacyGroupsPage;
