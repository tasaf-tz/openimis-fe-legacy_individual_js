import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button, Divider, Grid, Paper, TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Table, formatMessage, formatMessageWithValues } from '@openimis/fe-core';

import { LEGACY_INDIVIDUAL_MODULE_NAME as MODULE } from '../../constants';
import { flattenAnswers } from '../../utils/rm4';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  header: theme.paper.header,
  title: theme.paper.title,
  action: { ...theme.paper.action, display: 'flex', justifyContent: 'flex-end' },
  search: { padding: theme.spacing(1, 2) },
}));

function Rm4AnswersPanel({ jsonExt }) {
  const classes = useStyles();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const answers = useMemo(() => flattenAnswers(jsonExt), [jsonExt]);
  const needle = search.trim().toLowerCase();
  const shown = needle
    ? answers.filter((a) => a.field.toLowerCase().includes(needle) || a.value.toLowerCase().includes(needle))
    : answers;

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" className={classes.header}>
        <Grid item xs={6} className={classes.title}>{formatMessage(intl, MODULE, 'rm4.answers.title')}</Grid>
        <Grid item xs={6} className={classes.action}>
          <Button color="primary" disabled={!answers.length} onClick={() => setOpen(!open)}>
            {open
              ? formatMessage(intl, MODULE, 'rm4.answers.hide')
              : formatMessageWithValues(intl, MODULE, 'rm4.answers.show', { count: answers.length })}
          </Button>
        </Grid>
      </Grid>
      {open && (
        <>
          <Divider />
          <div className={classes.search}>
            <TextField
              fullWidth
              label={formatMessage(intl, MODULE, 'rm4.answers.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table
            module={MODULE}
            size="small"
            headers={['rm4.answers.field', 'rm4.answers.value']}
            itemFormatters={[(a) => a.field, (a) => a.value]}
            items={shown}
            itemIdentifier={(a) => a.field}
          />
        </>
      )}
    </Paper>
  );
}

export default Rm4AnswersPanel;
