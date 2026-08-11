import React from 'react';
import { Tooltip } from '@material-ui/core';

/**
 * Truncating table cell with the full value on hover.
 * fe-core's Table exposes no column-width prop, so width belongs with the
 * column definition in itemFormatters.
 */
export const cell = (value, width, align) => {
  const text = value == null ? '' : String(value);
  const style = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ...(width ? { maxWidth: width, width } : {}),
    ...(align ? { textAlign: align } : {}),
  };
  const content = <div style={style}>{value}</div>;
  return text ? <Tooltip title={text}><span>{content}</span></Tooltip> : content;
};

export default cell;
