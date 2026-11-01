/**
 * One number field of the placement form. It keeps what the user types as a draft and sends it as one change when
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
import { isFiniteNumber } from '../../../../utils/type.guards/is.finite.number';
import type { ObjectFieldDraft } from '../../interfaces/ObjectFieldDraft';
import type { ObjectTransformFieldProps } from '../../interfaces/ObjectTransformFieldProps';
import styles from './styles.module.scss';

export const ObjectTransformField = ({ label, value, decimals, onCommit }: ObjectTransformFieldProps): ReactNode => {
  const inputId: string = useId();
  // No draft means the user is not editing, so the stored value is shown. A cleared field is a draft with no value.
  const [draft, setDraft] = useState<ObjectFieldDraft | undefined>(undefined);

  const commitDraft = (): void => {
    if (!draft) {
      return;
    }

    setDraft(undefined);

    if (isFiniteNumber(draft.fieldValue) && draft.fieldValue !== value) {
      onCommit(draft.fieldValue);
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
        onChange={(fieldValue: number | null) => setDraft({ fieldValue })}
        onBlur={commitDraft}
        onPressEnter={commitDraft}
      />
    </div>
  );
};
