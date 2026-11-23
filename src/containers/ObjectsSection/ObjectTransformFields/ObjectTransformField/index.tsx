/**
 * One number field of the placement form. It keeps what the user types as a draft and sends it as one change when
 * the user leaves the field or presses Enter; an unchanged value sends nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { isFiniteNumber } from '../../../../utils/type.guards/is.finite.number';
import { DismissibleTooltip } from '../../../../views/DismissibleTooltip';
import type { ObjectFieldDraft } from '../../interfaces/ObjectFieldDraft';
import type { ObjectTransformFieldProps } from '../../interfaces/ObjectTransformFieldProps';
import styles from './styles.module.scss';
import { DecimalNumberInput } from '../../../../views/DecimalNumberInput';

const isDraftValueChanged = (draftValue: number | null | undefined, storedValue: number): draftValue is number =>
  isFiniteNumber(draftValue) && draftValue !== storedValue;

export const ObjectTransformField = (props: ObjectTransformFieldProps): ReactNode => {
  const { label, hintText, prefixComponent, value, decimals, onCommit } = props;
  const inputId: string = useId();
  // No draft means the user is not editing, so the stored value is shown. A cleared field is a draft with no value.
  const [draft, setDraft] = useState<ObjectFieldDraft | undefined>(undefined);

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
    <DismissibleTooltip title={hintText}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={inputId}>{label}</label>
        <DecimalNumberInput
          id={inputId}
          className={styles.input}
          prefix={<span className={styles.prefix} aria-hidden>{prefixComponent}</span>}
          value={draft ? draft.fieldValue : value}
          precision={decimals}
          controls={false}
          changeOnBlur={false}
          onChange={(fieldValue: number | null) => setDraft({ fieldValue })}
          onBlur={commitDraft}
          onPressEnter={commitDraft}
        />
      </div>
    </DismissibleTooltip>
  );
};
