/**
 * What "Read from connected laser" found: the values the laser reported, or a note that it reported none of them,
 * plus a warning when the laser reports laser mode off. A value the laser did not report is not listed, and an
 * unreported laser mode gives no warning.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_ALERT_TYPE_INFO, ANTD_ALERT_TYPE_WARNING } from '../../../../utils/antd.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { isBoolean } from '../../../../utils/type.guards/is.boolean';
import { isFiniteNumber } from '../../../../utils/type.guards/is.finite.number';
import type { LaserReadingAlertsProps } from './interfaces/LaserReadingAlertsProps';
import type { ReportedNumberFieldDefinition } from './interfaces/ReportedNumberFieldDefinition';
import styles from './styles.module.scss';

const READ_NUMBER_FIELDS: readonly ReportedNumberFieldDefinition[] = [
  { field: 'workAreaXMm', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_X },
  { field: 'workAreaYMm', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_Y },
  { field: 'sValueMax', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX },
];

export const LaserReadingAlerts = ({ reportedValues }: LaserReadingAlertsProps): ReactNode => {
  const { t } = useTranslation();
  const readLines: string[] = [];

  for (const { field, labelKey } of READ_NUMBER_FIELDS) {
    const reportedValue: number | undefined = reportedValues[field];

    if (isFiniteNumber(reportedValue)) {
      readLines.push(t(DEFAULT.MACHINE_PROFILES_READ_VALUE, { label: t(labelKey), value: reportedValue }));
    }
  }

  if (isBoolean(reportedValues.hasHomingSwitches)) {
    readLines.push(t(DEFAULT.MACHINE_PROFILES_READ_VALUE, {
      label: t(DEFAULT.MACHINE_PROFILES_FIELD_HOMING),
      value: t(reportedValues.hasHomingSwitches ? DEFAULT.MACHINE_PROFILES_READ_YES : DEFAULT.MACHINE_PROFILES_READ_NO),
    }));
  }

  // false only when the laser reports $32=0; an unreported laser mode stays undefined and gives no warning.
  const isLaserModeReportedOff: boolean = reportedValues.isLaserModeOn === false;

  return (
    <>
      {readLines.length ? (
        <Alert
          type={ANTD_ALERT_TYPE_INFO}
          title={t(DEFAULT.MACHINE_PROFILES_READ_SUMMARY)}
          description={(
            // A plain list: antd has no lightweight list for a few lines of text.
            <ul className={styles.readLines}>
              {readLines.map((readLine: string) => <li key={readLine}>{readLine}</li>)}
            </ul>
          )}
        />
      ) : (
        <Alert type={ANTD_ALERT_TYPE_INFO} title={t(DEFAULT.MACHINE_PROFILES_READ_NOTHING)} />
      )}
      {isLaserModeReportedOff && <Alert type={ANTD_ALERT_TYPE_WARNING} title={t(DEFAULT.MACHINE_PROFILES_LASER_MODE_OFF)} />}
    </>
  );
};
