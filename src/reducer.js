import {
  formatServerError,
  formatGraphQLError,
  parseData,
  pageInfo,
} from '@openimis/fe-core';

export const ACTION_TYPE = {
  SEARCH_LEGACY_INDIVIDUALS: 'LEGACY_INDIVIDUAL_SEARCH_INDIVIDUALS',
  GET_LEGACY_INDIVIDUAL: 'LEGACY_INDIVIDUAL_GET_INDIVIDUAL',
  SEARCH_LEGACY_GROUPS: 'LEGACY_INDIVIDUAL_SEARCH_GROUPS',
  GET_LEGACY_GROUP: 'LEGACY_INDIVIDUAL_GET_GROUP',
  SEARCH_LEGACY_GROUP_INDIVIDUALS: 'LEGACY_INDIVIDUAL_SEARCH_GROUP_INDIVIDUALS',
  SEARCH_LEGACY_IMPORT_BATCHES: 'LEGACY_INDIVIDUAL_SEARCH_IMPORT_BATCHES',
  GET_LEGACY_IMPORT_BATCH: 'LEGACY_INDIVIDUAL_GET_IMPORT_BATCH',
  UPLOAD_LEGACY_PSSN: 'LEGACY_INDIVIDUAL_UPLOAD_PSSN',
  PULL_LEGACY_PSSN_API: 'LEGACY_INDIVIDUAL_PULL_PSSN_API',
};

const STATE = {
  fetchingLegacyIndividuals: false,
  fetchedLegacyIndividuals: false,
  errorLegacyIndividuals: null,
  legacyIndividuals: [],
  legacyIndividualsPageInfo: {},
  legacyIndividualsTotalCount: 0,

  fetchingLegacyIndividual: false,
  fetchedLegacyIndividual: false,
  errorLegacyIndividual: null,
  legacyIndividual: null,

  fetchingLegacyGroups: false,
  fetchedLegacyGroups: false,
  errorLegacyGroups: null,
  legacyGroups: [],
  legacyGroupsPageInfo: {},
  legacyGroupsTotalCount: 0,

  fetchingLegacyGroup: false,
  fetchedLegacyGroup: false,
  errorLegacyGroup: null,
  legacyGroup: null,

  fetchingLegacyGroupIndividuals: false,
  fetchedLegacyGroupIndividuals: false,
  errorLegacyGroupIndividuals: null,
  legacyGroupIndividuals: [],
  legacyGroupIndividualsPageInfo: {},
  legacyGroupIndividualsTotalCount: 0,

  fetchingLegacyImportBatches: false,
  fetchedLegacyImportBatches: false,
  errorLegacyImportBatches: null,
  legacyImportBatches: [],
  legacyImportBatchesPageInfo: {},
  legacyImportBatchesTotalCount: 0,

  fetchingLegacyImportBatch: false,
  fetchedLegacyImportBatch: false,
  errorLegacyImportBatch: null,
  legacyImportBatch: null,

  uploadingLegacyPssn: false,
  uploadedLegacyPssn: false,
  legacyPssnUploadResult: null,
  legacyPssnUploadError: null,

  pullingLegacyApi: false,
  pulledLegacyApi: false,
  legacyApiPullResult: null,
  legacyApiPullError: null,
};

function reducer(state = STATE, action) {
  switch (action.type) {
    case `${ACTION_TYPE.SEARCH_LEGACY_INDIVIDUALS}_REQ`:
      return { ...state, fetchingLegacyIndividuals: true, fetchedLegacyIndividuals: false, errorLegacyIndividuals: null };
    case `${ACTION_TYPE.SEARCH_LEGACY_INDIVIDUALS}_RESP`:
      return {
        ...state,
        fetchingLegacyIndividuals: false,
        fetchedLegacyIndividuals: true,
        legacyIndividuals: parseData(action.payload.data.legacyIndividuals),
        legacyIndividualsPageInfo: pageInfo(action.payload.data.legacyIndividuals),
        legacyIndividualsTotalCount: action.payload.data.legacyIndividuals?.totalCount ?? 0,
        errorLegacyIndividuals: formatGraphQLError(action.payload),
      };
    case `${ACTION_TYPE.SEARCH_LEGACY_INDIVIDUALS}_ERR`:
      return { ...state, fetchingLegacyIndividuals: false, errorLegacyIndividuals: formatServerError(action.payload) };

    case `${ACTION_TYPE.GET_LEGACY_INDIVIDUAL}_REQ`:
      return { ...state, fetchingLegacyIndividual: true, fetchedLegacyIndividual: false, errorLegacyIndividual: null };
    case `${ACTION_TYPE.GET_LEGACY_INDIVIDUAL}_RESP`: {
      const data = parseData(action.payload.data.legacyIndividuals);
      return {
        ...state,
        fetchingLegacyIndividual: false,
        fetchedLegacyIndividual: true,
        legacyIndividual: data?.[0] ?? null,
        errorLegacyIndividual: formatGraphQLError(action.payload),
      };
    }
    case `${ACTION_TYPE.GET_LEGACY_INDIVIDUAL}_ERR`:
      return { ...state, fetchingLegacyIndividual: false, errorLegacyIndividual: formatServerError(action.payload) };

    case `${ACTION_TYPE.SEARCH_LEGACY_GROUPS}_REQ`:
      return { ...state, fetchingLegacyGroups: true, fetchedLegacyGroups: false, errorLegacyGroups: null };
    case `${ACTION_TYPE.SEARCH_LEGACY_GROUPS}_RESP`:
      return {
        ...state,
        fetchingLegacyGroups: false,
        fetchedLegacyGroups: true,
        legacyGroups: parseData(action.payload.data.legacyGroups),
        legacyGroupsPageInfo: pageInfo(action.payload.data.legacyGroups),
        legacyGroupsTotalCount: action.payload.data.legacyGroups?.totalCount ?? 0,
        errorLegacyGroups: formatGraphQLError(action.payload),
      };
    case `${ACTION_TYPE.SEARCH_LEGACY_GROUPS}_ERR`:
      return { ...state, fetchingLegacyGroups: false, errorLegacyGroups: formatServerError(action.payload) };

    case `${ACTION_TYPE.GET_LEGACY_GROUP}_REQ`:
      return { ...state, fetchingLegacyGroup: true, fetchedLegacyGroup: false, errorLegacyGroup: null };
    case `${ACTION_TYPE.GET_LEGACY_GROUP}_RESP`: {
      const data = parseData(action.payload.data.legacyGroups);
      return {
        ...state,
        fetchingLegacyGroup: false,
        fetchedLegacyGroup: true,
        legacyGroup: data?.[0] ?? null,
        errorLegacyGroup: formatGraphQLError(action.payload),
      };
    }
    case `${ACTION_TYPE.GET_LEGACY_GROUP}_ERR`:
      return { ...state, fetchingLegacyGroup: false, errorLegacyGroup: formatServerError(action.payload) };

    case `${ACTION_TYPE.SEARCH_LEGACY_GROUP_INDIVIDUALS}_REQ`:
      return { ...state, fetchingLegacyGroupIndividuals: true, fetchedLegacyGroupIndividuals: false, errorLegacyGroupIndividuals: null };
    case `${ACTION_TYPE.SEARCH_LEGACY_GROUP_INDIVIDUALS}_RESP`:
      return {
        ...state,
        fetchingLegacyGroupIndividuals: false,
        fetchedLegacyGroupIndividuals: true,
        legacyGroupIndividuals: parseData(action.payload.data.legacyGroupIndividuals),
        legacyGroupIndividualsPageInfo: pageInfo(action.payload.data.legacyGroupIndividuals),
        legacyGroupIndividualsTotalCount: action.payload.data.legacyGroupIndividuals?.totalCount ?? 0,
        errorLegacyGroupIndividuals: formatGraphQLError(action.payload),
      };
    case `${ACTION_TYPE.SEARCH_LEGACY_GROUP_INDIVIDUALS}_ERR`:
      return { ...state, fetchingLegacyGroupIndividuals: false, errorLegacyGroupIndividuals: formatServerError(action.payload) };

    case `${ACTION_TYPE.SEARCH_LEGACY_IMPORT_BATCHES}_REQ`:
      return { ...state, fetchingLegacyImportBatches: true, fetchedLegacyImportBatches: false, errorLegacyImportBatches: null };
    case `${ACTION_TYPE.SEARCH_LEGACY_IMPORT_BATCHES}_RESP`:
      return {
        ...state,
        fetchingLegacyImportBatches: false,
        fetchedLegacyImportBatches: true,
        legacyImportBatches: parseData(action.payload.data.legacyImportBatches),
        legacyImportBatchesPageInfo: pageInfo(action.payload.data.legacyImportBatches),
        legacyImportBatchesTotalCount: action.payload.data.legacyImportBatches?.totalCount ?? 0,
        errorLegacyImportBatches: formatGraphQLError(action.payload),
      };
    case `${ACTION_TYPE.SEARCH_LEGACY_IMPORT_BATCHES}_ERR`:
      return { ...state, fetchingLegacyImportBatches: false, errorLegacyImportBatches: formatServerError(action.payload) };

    case `${ACTION_TYPE.GET_LEGACY_IMPORT_BATCH}_REQ`:
      return { ...state, fetchingLegacyImportBatch: true, fetchedLegacyImportBatch: false, errorLegacyImportBatch: null };
    case `${ACTION_TYPE.GET_LEGACY_IMPORT_BATCH}_RESP`: {
      const data = parseData(action.payload.data.legacyImportBatches);
      return {
        ...state,
        fetchingLegacyImportBatch: false,
        fetchedLegacyImportBatch: true,
        legacyImportBatch: data?.[0] ?? null,
        errorLegacyImportBatch: formatGraphQLError(action.payload),
      };
    }
    case `${ACTION_TYPE.GET_LEGACY_IMPORT_BATCH}_ERR`:
      return { ...state, fetchingLegacyImportBatch: false, errorLegacyImportBatch: formatServerError(action.payload) };

    case `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_REQ`:
      return { ...state, uploadingLegacyPssn: true, uploadedLegacyPssn: false, legacyPssnUploadError: null, legacyPssnUploadResult: null };
    case `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_RESP`:
      return { ...state, uploadingLegacyPssn: false, uploadedLegacyPssn: true, legacyPssnUploadResult: action.payload, legacyPssnUploadError: null };
    case `${ACTION_TYPE.UPLOAD_LEGACY_PSSN}_ERR`:
      return { ...state, uploadingLegacyPssn: false, legacyPssnUploadError: action.payload };

    case `${ACTION_TYPE.PULL_LEGACY_PSSN_API}_REQ`:
      return { ...state, pullingLegacyApi: true, pulledLegacyApi: false, legacyApiPullError: null, legacyApiPullResult: null };
    case `${ACTION_TYPE.PULL_LEGACY_PSSN_API}_RESP`:
      return { ...state, pullingLegacyApi: false, pulledLegacyApi: true, legacyApiPullResult: action.payload, legacyApiPullError: null };
    case `${ACTION_TYPE.PULL_LEGACY_PSSN_API}_ERR`:
      return { ...state, pullingLegacyApi: false, legacyApiPullError: action.payload };

    default:
      return state;
  }
}

export default reducer;
