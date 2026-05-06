/* eslint-disable import/prefer-default-export */
import {
  graphql,
  formatPageQueryWithCount,
  formatPageQuery,
  formatGQLString,
  baseApiUrl,
  apiHeaders,
} from '@openimis/fe-core';

import { ACTION_TYPE } from './reducer';

const LEGACY_INDIVIDUAL_PROJECTION = () => [
  'id',
  'uuid',
  'legacyCode',
  'firstName',
  'middleName',
  'lastName',
  'dob',
  'gender',
  'disability',
  'phoneNo',
  'nin',
  'premno',
  'jsonExt',
  'dateCreated',
  'isDeleted',
  'location { id uuid name code type }',
  'facility { id uuid name code }',
  'importBatch { id uuid code status }',
];

const LEGACY_GROUP_PROJECTION = () => [
  'id',
  'uuid',
  'code',
  'jsonExt',
  'dateCreated',
  'isDeleted',
  'location { id uuid name code type }',
  'importBatch { id uuid code status }',
];

const LEGACY_GROUP_INDIVIDUAL_PROJECTION = () => [
  'id',
  'uuid',
  'role',
  'relationshipCode',
  'recipientType',
  'memberLine',
  'jsonExt',
  'group { id uuid code }',
  'individual { id uuid legacyCode firstName middleName lastName gender dob nin premno phoneNo }',
];

const LEGACY_IMPORT_BATCH_PROJECTION = () => [
  'id',
  'uuid',
  'code',
  'sourceSystem',
  'householdFileName',
  'memberFileName',
  'status',
  'startedAt',
  'finishedAt',
  'totalHouseholds',
  'totalMembers',
  'successHouseholdCount',
  'successMemberCount',
  'warningCount',
  'errorCount',
  'error',
  'jsonExt',
  'dateCreated',
];

export function fetchLegacyIndividuals(params) {
  const payload = formatPageQueryWithCount(
    'legacyIndividuals',
    params,
    LEGACY_INDIVIDUAL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_LEGACY_INDIVIDUALS);
}

export function fetchLegacyIndividual(uuid) {
  const filters = [`id: "${formatGQLString(uuid)}"`];
  const payload = formatPageQuery(
    'legacyIndividuals',
    filters,
    LEGACY_INDIVIDUAL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_LEGACY_INDIVIDUAL);
}

export function fetchLegacyGroups(params) {
  const payload = formatPageQueryWithCount(
    'legacyGroups',
    params,
    LEGACY_GROUP_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_LEGACY_GROUPS);
}

export function fetchLegacyGroup(uuid) {
  const filters = [`id: "${formatGQLString(uuid)}"`];
  const payload = formatPageQuery(
    'legacyGroups',
    filters,
    LEGACY_GROUP_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_LEGACY_GROUP);
}

export function fetchLegacyGroupIndividuals(params) {
  const payload = formatPageQueryWithCount(
    'legacyGroupIndividuals',
    params,
    LEGACY_GROUP_INDIVIDUAL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_LEGACY_GROUP_INDIVIDUALS);
}

export function fetchLegacyImportBatches(params) {
  const payload = formatPageQueryWithCount(
    'legacyImportBatches',
    params,
    LEGACY_IMPORT_BATCH_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_LEGACY_IMPORT_BATCHES);
}

export function fetchLegacyImportBatch(uuid) {
  const filters = [`id: "${formatGQLString(uuid)}"`];
  const payload = formatPageQuery(
    'legacyImportBatches',
    filters,
    LEGACY_IMPORT_BATCH_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_LEGACY_IMPORT_BATCH);
}

export function uploadLegacyPssnPair({ householdFile, memberFile, code }) {
  return async (dispatch) => {
    dispatch({ type: `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_REQ` });
    try {
      const formData = new FormData();
      formData.append('household_file', householdFile);
      formData.append('member_file', memberFile);
      if (code) formData.append('code', code);

      const url = `${baseApiUrl}/legacy_individual/import_pssn/`;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: apiHeaders,
        body: formData,
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false) {
        dispatch({ type: `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_ERR`, payload: json.error || `HTTP ${response.status}` });
        return { success: false, error: json.error };
      }
      dispatch({ type: `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_RESP`, payload: json.data || {} });
      return { success: true, data: json.data };
    } catch (e) {
      dispatch({ type: `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_ERR`, payload: String(e) });
      return { success: false, error: String(e) };
    }
  };
}
