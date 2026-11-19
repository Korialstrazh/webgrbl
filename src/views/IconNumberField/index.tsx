/**
 * A compact number field: an icon before the value and its unit after it, as in the object placement fields. The full
 * label stays for screen readers and shows in a tooltip.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { InputNumber, Tooltip } from 'antd';
import type { InputNumberProps } from 'antd';
import type { ReactNode } from 'react';
import { ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import styles from './styles.module.scss';

interface IconNumberFieldProps extends Omit<InputNumberProps<number>, 'id' | 'prefix' | 'suffix' | 'controls'> {
  inputId: string;
  /** The full name of the field: the hidden label and the tooltip. */
  labelText: string;
  /** Replaces the name in the tooltip where a GRBL term needs explaining. */
  hintText?: string;
  iconComponent: ReactNode;
  /** A short word beside the icon, where two fields share an icon. */
  captionText?: string;
  unitText?: string;
  /** False where the visible caption already names the field, so no tooltip covers the field above it. */
  hasTooltip?: boolean;
}

export const IconNumberField = (props: IconNumberFieldProps): ReactNode => {
  const { inputId, labelText, hintText, iconComponent, captionText, unitText, ...fieldProps } = props;
  const { hasTooltip = true, className, ...inputProps } = fieldProps;
  const inputComponent: ReactNode = (
    <InputNumber<number>
      {...inputProps}
      id={inputId}
      className={[styles.input, className].join(' ')}
      controls={false}
      prefix={
        <span className={styles.adornment} aria-hidden>
          {iconComponent}
          {captionText && <span className={styles.caption}>{captionText}</span>}
        </span>
      }
      suffix={unitText && <span className={styles.adornment} aria-hidden>{unitText}</span>}
    />
  );

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{labelText}</label>
      {hasTooltip
        ? (
          <Tooltip title={hintText ?? labelText} trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}>
            {inputComponent}
          </Tooltip>
        )
        : inputComponent}
    </div>
  );
};
