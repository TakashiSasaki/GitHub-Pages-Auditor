import React from 'react';

export const REPORT_TABLE_COLUMN_COUNT = 6;

export const REPORT_TABLE_COLUMNS = {
  index: '2.5rem',
  repository: 'min(20vw, 18rem)',
  pages: 'min(20vw, 14rem)',
  deploy: 'min(20vw, 14rem)',
  domain: 'min(20vw, 16rem)',
  https: 'min(20vw, 16rem)',
} as const;

export const ROW_HEIGHT = 72;

export function buildReportTableStyle(): React.CSSProperties {
  return {
    '--report-col-index': REPORT_TABLE_COLUMNS.index,
    '--report-col-repository': REPORT_TABLE_COLUMNS.repository,
    '--report-col-pages': REPORT_TABLE_COLUMNS.pages,
    '--report-col-deploy': REPORT_TABLE_COLUMNS.deploy,
    '--report-col-domain': REPORT_TABLE_COLUMNS.domain,
    '--report-col-https': REPORT_TABLE_COLUMNS.https,
    width: 'calc(var(--report-col-index) + var(--report-col-repository) + var(--report-col-pages) + var(--report-col-deploy) + var(--report-col-domain) + var(--report-col-https))',
  } as React.CSSProperties;
}
