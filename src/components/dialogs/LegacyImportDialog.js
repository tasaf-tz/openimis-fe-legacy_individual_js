import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  Button, LinearProgress, Link, TextField, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
  PublishedComponent, formatMessage, formatMessageWithValues, useHistory, useModulesManager,
} from '@openimis/fe-core';
import {
  ImportDialog, FileDrop, ChoiceList, StatRow,
} from '@openimis/fe-tasaf_common';

import { uploadLegacyPssnPair, pullLegacyPssnApi } from '../../actions';

const MODULE = 'legacy_individual';
const CSV = 'CSV';
const API = 'API';
// nginx client_max_body_size, for both files together.
const MAX_UPLOAD_BYTES = 64 * 1024 * 1024;

// Keep in step with the backend's pssn_legacy_upload.py (required) and columns.py (known).
const REQUIRED = {
  household: ['REGISTRATIONNO'],
  member: ['REGISTRATIONNO', 'MEMBERLINENO'],
};
const KNOWN = {
  household: [
    'REGISTRATIONNO', 'UNIQUENO', 'WAVENO', 'ROUNDNO', 'BATCHNO', 'FORMNO', 'REGION_CODE', 'DISTRICT_CODE',
    'WARD_CODE', 'VILLAGE_CODE', 'URBANORRULAR', 'AREA_CODE', 'SUBVILLAGE', 'POPULAR_AREA', 'HH_FIRSTNAME',
    'HH_MIDDLENAME', 'HH_LASTNAME', 'NO_HH_CHANGE', 'NEW_HH_FIRSTNAME', 'NEW_HH_MIDDLENAME', 'NEW_HH_LASTNAME',
    'AGE', 'DOB', 'POPULAR_HH_NAME', 'HHSTATUS', 'HHSIZE', 'PMTSCORE', 'HHCLASSIFICATION', 'V_STATUS', 'PHONE_NO',
    'BANK_ACCOUNT', 'EPAYMENT_CODE', 'EPAYMENT_APPROACH', 'EPAYMENT_ACCOUNT', 'EPAYMENT_BANK_BRANCH',
    'EPAYMENT_STATUS', 'EPAYMENT_REGISTERED_NAME', 'APR_EPAYMENT_CODE', 'APR_EPAYMENT_ACCOUNT',
    'APR_EPAYMENT_BANK_BRANCH', 'APR_EPAYMENT_APPROACH', 'APR_EPAYMENT_REGISTERED_NAME', 'APRROVED_DATE',
    'APPROVED_BY', 'ENROLLMENT_DATE', 'SIGNED_REPRESENTATIVE', 'SUPERVISOR_NAME', 'SIGNED_BY_SUPERVISOR',
    'DATAENTRYID', 'CAPTUREDBY', 'DATECAPTURED', 'UPDATEDBY', 'DATEUPDATED', 'APPROVEDBY', 'DATEAPPROVED',
    'REVIEWED_BY', 'REVIEWED_DATE', 'REMARKS',
  ],
  member: [
    'REGISTRATIONNO', 'MEMBERLINENO', 'UNIQUENO', 'REF_UNIQUENO', 'FIRSTNAME', 'MIDDLENAME', 'LASTNAME',
    'NEW_FIRSTNAME', 'NEW_MIDDLENAME', 'NEW_LASTNAME', 'NO_CHANGE', 'SEX', 'AGE', 'NEW_AGE', 'GRADE',
    'DATEOFBIRTH', 'NEW_DATEOFBIRTH', 'DISABILITY', 'DISLEVEL', 'DIS_REASON', 'CHRONICALILINESS',
    'RELATIONSHIPTOHEAD', 'NEW_RELATIONSHIPTOHEAD', 'HH_REP', 'NIDA_NIN', 'NIDA_FIRSTNAME', 'NIDA_MIDDLENAME',
    'NIDA_LASTNAME', 'NIDA_BIRTH_DATE', 'NIDA_EXPIRY_DATE', 'NIDA_STATUS', 'NO_NIDA_REASON', 'PREM_NO',
    'PREM_STATUS', 'PREM_CODE', 'FACILITY_CODE', 'FACILITY_NAME', 'SIS_DOB', 'SIS_SEX', 'SIS_SCHOOL_ID',
    'SIS_ID', 'SIS_PHOTO', 'SIS_SCHOOL_CODE', 'SIS_GRADE', 'SIS_UPDATE_YEAR', 'SERVICE_CAT',
    'HH_MEMBER_STATUS', 'HH_MEMBER_EXEMPTION', 'V_STATUS',
  ],
};

const pad = (n) => String(n).padStart(2, '0');
const defaultBatchCode = () => {
  const d = new Date();
  return `PSSN-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    + `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};
const formatSize = (bytes) => (bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

async function inspectCsv(file, kind) {
  if (!file.name.toLowerCase().endsWith('.csv')) return { file, error: 'notCsv' };
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const header = (lines[0] || '').replace(/^﻿/, '').split(',')
    .map((c) => c.trim().replace(/^"|"$/g, '').toUpperCase());
  const rows = lines.slice(1).filter((l) => l.trim()).length;
  const missing = REQUIRED[kind].filter((c) => !header.includes(c));
  const recognised = header.filter((c) => KNOWN[kind].includes(c)).length;
  return {
    file, rows, columns: header.length, recognised, missing,
  };
}

function downloadTemplate(kind) {
  const blob = new Blob([`${KNOWN[kind].join(',')}\n`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pssn_${kind}_template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const useStyles = makeStyles((theme) => ({
  required: { color: theme.palette.error.main },
  link: { cursor: 'pointer' },
  pickers: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing(2) },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: theme.spacing(0.5, 0) },
}));

function FileSlot({
  kind, value, onPick, onClear, t, tv,
}) {
  let meta = null;
  const bad = !!value && (!!value.error || value.missing?.length > 0);
  if (value?.error === 'notCsv') meta = t('import.file.notCsv');
  else if (value?.missing?.length) meta = tv('import.file.missing', { columns: value.missing.join(', ') });
  else if (value) meta = tv('import.file.meta', { rows: value.rows.toLocaleString(), size: formatSize(value.file.size) });
  return (
    <FileDrop
      file={value?.file}
      meta={meta}
      bad={bad}
      dropText={t(`import.drop.${kind}`)}
      browseText={t('import.drop.browse')}
      removeLabel={t('import.file.remove')}
      onPick={onPick}
      onRemove={onClear}
    />
  );
}

function LegacyImportDialog({
  open,
  onClose,
  onImported,
  uploadingLegacyPssn,
  legacyPssnUploadError,
  uploadLegacyPssnPair,
  pullingLegacyApi,
  legacyApiPullError,
  pullLegacyPssnApi,
}) {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const t = (id) => formatMessage(intl, MODULE, id);
  const tv = (id, values) => formatMessageWithValues(intl, MODULE, id, values);

  const [source, setSource] = useState(CSV);
  const [step, setStep] = useState(1);
  const [household, setHousehold] = useState(null);
  const [member, setMember] = useState(null);
  const [code, setCode] = useState(defaultBatchCode);
  const [region, setRegion] = useState(null);
  const [district, setDistrict] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);

  const busy = uploadingLegacyPssn || pullingLegacyApi;

  const reset = () => {
    setSource(CSV); setStep(1); setHousehold(null); setMember(null); setCode(defaultBatchCode());
    setRegion(null); setDistrict(null); setDryRunResult(null);
  };
  const close = () => { reset(); onClose?.(); };

  const fileOk = (f) => f && !f.error && !f.missing?.length;
  const tooBig = household && member && household.file.size + member.file.size > MAX_UPLOAD_BYTES;

  let blocker = null;
  if (source === CSV) {
    if (!household) blocker = t('import.hint.household');
    else if (!member) blocker = t('import.hint.member');
    else if (!fileOk(household) || !fileOk(member)) blocker = t('import.hint.fix');
    else if (tooBig) blocker = t('import.hint.tooBig');
  } else if (!district) blocker = t('import.hint.district');

  const preview = async () => {
    if (source === API) {
      setDryRunResult(null);
      const result = await pullLegacyPssnApi({
        districtCode: district.code, regionCode: region?.code, paaName: district.name, dryRun: true,
      });
      if (!result?.success) return;
      setDryRunResult(result.data || {});
    }
    setStep(2);
  };

  const start = async () => {
    if (source === CSV) {
      const result = await uploadLegacyPssnPair({
        householdFile: household.file, memberFile: member.file, code: code.trim() || undefined,
      });
      if (result?.success && result.data?.batch_uuid) {
        close();
        history.push(`/${modulesManager.getRef('legacy_individual.route.import_batch')}/${result.data.batch_uuid}`);
      }
      return;
    }
    const result = await pullLegacyPssnApi({
      districtCode: district.code, regionCode: region?.code, paaName: district.name, dryRun: false,
    });
    if (result?.success) {
      onImported?.();
      close();
    }
  };

  const slot = (kind, value, setValue) => (
    <div>
      <Typography color="primary" gutterBottom>
        {t(`import.${kind}File`)}
        {' '}
        <span className={classes.required}>*</span>
      </Typography>
      <FileSlot
        kind={kind}
        value={value}
        onPick={async (file) => setValue(await inspectCsv(file, kind))}
        onClear={() => setValue(null)}
        t={t}
        tv={tv}
      />
    </div>
  );

  const stat = (labelKey, value) => ({
    label: t(labelKey),
    value: typeof value === 'string' ? value : (value == null ? '—' : Number(value).toLocaleString()),
  });

  const uploadError = source === CSV ? legacyPssnUploadError : legacyApiPullError;

  return (
    <ImportDialog
      open={!!open}
      title={t('dialog.title')}
      step={t(step === 1 ? 'import.step1' : 'import.step2')}
      onClose={close}
      busy={busy}
      closeLabel={t('dialog.close')}
      hint={step === 1 ? blocker : null}
      actions={(
        <>
          <Button variant="outlined" onClick={step === 1 ? close : () => setStep(1)} disabled={busy}>
            {t(step === 1 ? 'import.cancel' : 'import.back')}
          </Button>
          {step === 1 ? (
            <Button color="primary" variant="contained" disableElevation disabled={busy || !!blocker} onClick={preview}>
              {t('import.previewBtn')}
            </Button>
          ) : (
            <Button color="primary" variant="contained" disableElevation disabled={busy} onClick={start}>
              {t('dialog.startImport')}
            </Button>
          )}
        </>
      )}
    >
      {step === 1 && (
        <>
          <ChoiceList
            value={source}
            onChange={(value) => { setSource(value); setDryRunResult(null); }}
            options={[
              { value: CSV, title: t('import.source.csv'), sub: t('import.source.csvSub') },
              { value: API, title: t('import.source.api'), sub: t('import.source.apiSub') },
            ]}
          />

          {source === CSV && (
            <>
              {slot('household', household, setHousehold)}
              <div>
                {slot('member', member, setMember)}
                <Typography variant="caption">
                  <Link className={classes.link} onClick={() => downloadTemplate('household')}>
                    {t('import.template.household')}
                  </Link>
                  {' · '}
                  <Link className={classes.link} onClick={() => downloadTemplate('member')}>
                    {t('import.template.member')}
                  </Link>
                </Typography>
              </div>
              <TextField
                label={t('import.batchCode')}
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 64))}
                helperText={t('import.batchCodeHelp')}
                fullWidth
              />
            </>
          )}

          {source === API && (
            <>
              <Typography variant="body2" color="textSecondary">{t('dialog.api.intro')}</Typography>
              <div className={classes.pickers}>
                <PublishedComponent
                  pubRef="location.LocationPicker"
                  value={region}
                  onChange={(v) => { setRegion(v); setDistrict(null); }}
                  locationLevel={0}
                  label={t('dialog.api.region')}
                />
                <PublishedComponent
                  pubRef="location.LocationPicker"
                  value={district}
                  onChange={(v) => setDistrict(v)}
                  parentLocation={region}
                  locationLevel={1}
                  label={t('dialog.api.district')}
                />
              </div>
            </>
          )}
        </>
      )}

      {step === 2 && source === CSV && (
        <>
          <StatRow
            stats={[
              stat('import.preview.households', household.rows),
              stat('import.preview.members', member.rows),
              stat('import.preview.size', formatSize(household.file.size + member.file.size)),
            ]}
          />
          <div>
            <Typography variant="body2" className={classes.summaryRow}>
              <span>{household.file.name}</span>
              <span>{tv('import.preview.columns', { recognised: household.recognised, total: household.columns })}</span>
            </Typography>
            <Typography variant="body2" className={classes.summaryRow}>
              <span>{member.file.name}</span>
              <span>{tv('import.preview.columns', { recognised: member.recognised, total: member.columns })}</span>
            </Typography>
            <Typography variant="body2" className={classes.summaryRow}>
              <span>{t('import.batchCode')}</span>
              <span>{code.trim() || '—'}</span>
            </Typography>
          </div>
          <Typography variant="caption" color="textSecondary">{t('dialog.csv.intro')}</Typography>
        </>
      )}

      {step === 2 && source === API && dryRunResult && (
        <>
          <StatRow
            stats={[
              stat('dialog.dryRunPreview.rawRows', dryRunResult.raw_rows),
              stat('dialog.dryRunPreview.households', dryRunResult.stats?.total_households),
              stat('dialog.dryRunPreview.members', dryRunResult.stats?.total_members),
            ]}
          />
          <Typography variant="caption" color="textSecondary">
            {tv('import.preview.apiNote', { district: district?.name ?? '' })}
          </Typography>
        </>
      )}

      {busy && <LinearProgress />}
      {!!uploadError && <Alert severity="error">{String(uploadError)}</Alert>}
    </ImportDialog>
  );
}

const mapStateToProps = (state) => ({
  uploadingLegacyPssn: state.legacy_individual.uploadingLegacyPssn,
  legacyPssnUploadError: state.legacy_individual.legacyPssnUploadError,
  pullingLegacyApi: state.legacy_individual.pullingLegacyApi,
  legacyApiPullError: state.legacy_individual.legacyApiPullError,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  { uploadLegacyPssnPair, pullLegacyPssnApi }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(LegacyImportDialog);
