/**
 * The baud rate field of the connection popover, shown under its Advanced section: most lasers talk at the default
 * rate, so it stays out of the way until asked for.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DashboardOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { GRBL_BAUD_RATES } from '../../../utils/grbl/grbl.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { BaudRateSelected, selectBaudRate } from '../../../utils/states/grbl.connection.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import styles from '../styles.module.scss';

interface BaudRateFieldProps {
  /** True while a laser is connected or connecting, when the rate cannot change. */
  isLocked: boolean;
}

const BAUD_OPTIONS: SelectProps<number>['options'] = GRBL_BAUD_RATES.map((rate: number) => ({
  value: rate,
  label: String(rate),
}));

export const BaudRateField = ({ isLocked }: BaudRateFieldProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const baudRate: number = useSelector(selectBaudRate);
  const baudSelectId: string = useId();

  // Plain label: antd has no standalone label component outside Form.
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={baudSelectId}>
        <DashboardOutlined aria-hidden />
        {t(DEFAULT.CONNECTION_POPOVER_BAUD)}
      </label>
      <Select<number>
        id={baudSelectId}
        className={styles.select}
        value={baudRate}
        options={BAUD_OPTIONS}
        disabled={isLocked}
        virtual={false}
        onChange={(nextBaudRate: number) => dispatch(new BaudRateSelected({ baudRate: nextBaudRate }))}
      />
    </div>
  );
};
