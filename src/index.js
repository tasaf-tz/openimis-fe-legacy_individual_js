/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import flatten from 'flat';
import { FormattedMessage } from '@openimis/fe-core';
import People from '@material-ui/icons/People';
import Person from '@material-ui/icons/Person';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import messages_en from './translations/en.json';
import reducer from './reducer';

import LegacyIndividualsPage from './pages/LegacyIndividualsPage';
import LegacyIndividualPage from './pages/LegacyIndividualPage';
import LegacyGroupsPage from './pages/LegacyGroupsPage';
import LegacyGroupPage from './pages/LegacyGroupPage';
import LegacyImportBatchesPage from './pages/LegacyImportBatchesPage';
import LegacyImportBatchPage from './pages/LegacyImportBatchPage';

import LegacyPssnUploadDialog from './components/dialogs/LegacyPssnUploadDialog';

import {
  LEGACY_INDIVIDUAL_MODULE_NAME,
  LEGACY_PSSN_UPLOAD_DIALOG_KEY,
  RIGHT_LEGACY_INDIVIDUAL_SEARCH,
  RIGHT_LEGACY_GROUP_SEARCH,
  RIGHT_LEGACY_IMPORT_EXECUTE,
} from './constants';

const ROUTE_LEGACY_INDIVIDUALS = 'legacy/individuals';
const ROUTE_LEGACY_INDIVIDUAL = 'legacy/individuals/individual';
const ROUTE_LEGACY_GROUPS = 'legacy/groups';
const ROUTE_LEGACY_GROUP = 'legacy/groups/group';
const ROUTE_LEGACY_IMPORTS = 'legacy/imports';
const ROUTE_LEGACY_IMPORT_BATCH = 'legacy/imports/batch';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: LEGACY_INDIVIDUAL_MODULE_NAME, reducer }],

  'core.Router': [
    { path: ROUTE_LEGACY_INDIVIDUALS, component: LegacyIndividualsPage },
    { path: `${ROUTE_LEGACY_INDIVIDUAL}/:legacy_individual_uuid?`, component: LegacyIndividualPage },
    { path: ROUTE_LEGACY_GROUPS, component: LegacyGroupsPage },
    { path: `${ROUTE_LEGACY_GROUP}/:legacy_group_uuid?`, component: LegacyGroupPage },
    { path: ROUTE_LEGACY_IMPORTS, component: LegacyImportBatchesPage },
    { path: `${ROUTE_LEGACY_IMPORT_BATCH}/:batch_uuid?`, component: LegacyImportBatchPage },
  ],

  'socialProtection.MainMenu': [
    {
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.individuals" />,
      icon: <Person />,
      route: `/${ROUTE_LEGACY_INDIVIDUALS}`,
      filter: (rights) => rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH),
      id: 'legacy_individual.individuals',
    },
    {
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.groups" />,
      icon: <People />,
      route: `/${ROUTE_LEGACY_GROUPS}`,
      filter: (rights) => rights.includes(RIGHT_LEGACY_GROUP_SEARCH),
      id: 'legacy_individual.groups',
    },
    {
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.imports" />,
      icon: <CloudUploadIcon />,
      route: `/${ROUTE_LEGACY_IMPORTS}`,
      filter: (rights) => (
        rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH)
        || rights.includes(RIGHT_LEGACY_IMPORT_EXECUTE)
      ),
      id: 'legacy_individual.imports',
    },
  ],

  'report.MainMenu': [
    {
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.individuals" />,
      icon: <Person />,
      route: `/${ROUTE_LEGACY_INDIVIDUALS}`,
      filter: (rights) => rights.includes(RIGHT_LEGACY_INDIVIDUAL_SEARCH),
      id: 'report.reports',
    },
  ],

  refs: [
    { key: 'legacy_individual.route.individuals', ref: ROUTE_LEGACY_INDIVIDUALS },
    { key: 'legacy_individual.route.individual', ref: ROUTE_LEGACY_INDIVIDUAL },
    { key: 'legacy_individual.route.groups', ref: ROUTE_LEGACY_GROUPS },
    { key: 'legacy_individual.route.group', ref: ROUTE_LEGACY_GROUP },
    { key: 'legacy_individual.route.imports', ref: ROUTE_LEGACY_IMPORTS },
    { key: 'legacy_individual.route.import_batch', ref: ROUTE_LEGACY_IMPORT_BATCH },
    { key: LEGACY_PSSN_UPLOAD_DIALOG_KEY, ref: LegacyPssnUploadDialog },
  ],

  [LEGACY_PSSN_UPLOAD_DIALOG_KEY]: LegacyPssnUploadDialog,
};

export const LegacyIndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
