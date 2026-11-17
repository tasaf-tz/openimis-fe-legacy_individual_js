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
import Rm4GroupsPage from './pages/rm4/Rm4GroupsPage';
import Rm4GroupPage from './pages/rm4/Rm4GroupPage';
import Rm4IndividualsPage from './pages/rm4/Rm4IndividualsPage';
import Rm4IndividualPage from './pages/rm4/Rm4IndividualPage';

import LegacyImportDialog from './components/dialogs/LegacyImportDialog';

import {
  LEGACY_INDIVIDUAL_MODULE_NAME,
  LEGACY_PSSN_UPLOAD_DIALOG_KEY,
  RIGHT_LEGACY_INDIVIDUAL_SEARCH,
  RIGHT_LEGACY_GROUP_SEARCH,
  RIGHT_LEGACY_IMPORT_EXECUTE,
  RIGHT_RM4_GROUP_SEARCH,
  RIGHT_RM4_INDIVIDUAL_SEARCH,
} from './constants';

const ROUTE_LEGACY_INDIVIDUALS = 'legacy/individuals';
const ROUTE_LEGACY_INDIVIDUAL = 'legacy/individuals/individual';
const ROUTE_LEGACY_GROUPS = 'legacy/groups';
const ROUTE_LEGACY_GROUP = 'legacy/groups/group';
const ROUTE_LEGACY_IMPORTS = 'legacy/imports';
const ROUTE_LEGACY_IMPORT_BATCH = 'legacy/imports/batch';
const ROUTE_RM4_INDIVIDUALS = 'legacy/rm4/members';
const ROUTE_RM4_INDIVIDUAL = 'legacy/rm4/members/member';
const ROUTE_RM4_GROUPS = 'legacy/rm4/households';
const ROUTE_RM4_GROUP = 'legacy/rm4/households/household';

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
    { path: ROUTE_RM4_INDIVIDUALS, component: Rm4IndividualsPage },
    { path: `${ROUTE_RM4_INDIVIDUAL}/:rm4_individual_uuid`, component: Rm4IndividualPage },
    { path: ROUTE_RM4_GROUPS, component: Rm4GroupsPage },
    { path: `${ROUTE_RM4_GROUP}/:rm4_group_uuid`, component: Rm4GroupPage },
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
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.rm4Individuals" />,
      icon: <Person />,
      route: `/${ROUTE_RM4_INDIVIDUALS}`,
      filter: (rights) => rights.includes(RIGHT_RM4_INDIVIDUAL_SEARCH),
      id: 'legacy_individual.rm4Individuals',
    },
    {
      text: <FormattedMessage module={LEGACY_INDIVIDUAL_MODULE_NAME} id="menu.rm4Groups" />,
      icon: <People />,
      route: `/${ROUTE_RM4_GROUPS}`,
      filter: (rights) => rights.includes(RIGHT_RM4_GROUP_SEARCH),
      id: 'legacy_individual.rm4Groups',
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

  refs: [
    { key: 'legacy_individual.route.individuals', ref: ROUTE_LEGACY_INDIVIDUALS },
    { key: 'legacy_individual.route.individual', ref: ROUTE_LEGACY_INDIVIDUAL },
    { key: 'legacy_individual.route.groups', ref: ROUTE_LEGACY_GROUPS },
    { key: 'legacy_individual.route.group', ref: ROUTE_LEGACY_GROUP },
    { key: 'legacy_individual.route.imports', ref: ROUTE_LEGACY_IMPORTS },
    { key: 'legacy_individual.route.import_batch', ref: ROUTE_LEGACY_IMPORT_BATCH },
    { key: 'legacy_individual.route.rm4_individuals', ref: ROUTE_RM4_INDIVIDUALS },
    { key: 'legacy_individual.route.rm4_individual', ref: ROUTE_RM4_INDIVIDUAL },
    { key: 'legacy_individual.route.rm4_groups', ref: ROUTE_RM4_GROUPS },
    { key: 'legacy_individual.route.rm4_group', ref: ROUTE_RM4_GROUP },
    { key: LEGACY_PSSN_UPLOAD_DIALOG_KEY, ref: LegacyImportDialog },
  ],

  [LEGACY_PSSN_UPLOAD_DIALOG_KEY]: LegacyImportDialog,
};

export const LegacyIndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
