/**
 * One number field of the layer settings. It keeps what the user types as a draft and sends it as one change when
 * the user leaves the field or presses Enter; an unchanged value sends nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { InputNumber } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { LayerFieldDraft } from '../interfaces/LayerFieldDraft';
import type { LayerNumberFieldProps } from '../interfaces/LayerNumberFieldProps';
import styles from './styles.module.scss';

const isDraftValueChanged = (draftValue: number | null | undefined, storedValue: number): draftValue is number =>
  isFiniteNumber(draftValue) && draftValue !== storedValue;

export const LayerNumberField = ({ label, value, decimals, hintText, onCommit }: LayerNumberFieldProps): ReactNode => {
  const inputId: string = useId();
  // No draft means the user is not editing, so the stored value is shown. A cleared field is a draft with no value.
  const [draft, setDraft] = useState<LayerFieldDraft | undefined>(undefined);

  const commitDraft = (): void => {
    // Cleared even with no draft: on Enter the input reports its rounded text as a change just before this runs,
    // and that change must not survive as a draft the user never typed.
    setDraft(undefined);
    const draftValue: number | null | undefined = draft?.fieldValue;

    if (isDraftValueChanged(draftValue, value)) {
      onCommit(draftValue);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <InputNumber
        id={inputId}
        className={styles.input}
        value={draft ? draft.fieldValue : value}
        precision={decimals}
        controls={false}
        changeOnBlur={false}
        onChange={(fieldValue: number | null) => setDraft({ fieldValue })}
        onBlur={commitDraft}
        onPressEnter={commitDraft}
      />
      {hintText && <span className={styles.hint}>{hintText}</span>}
    </div>
  );
};
