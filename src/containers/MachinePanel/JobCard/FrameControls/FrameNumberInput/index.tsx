/**
 * A number of the active machine profile that the frame uses, such as its margin or speed: the user types it and it
 * is saved once it is valid.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_INPUT_NUMBER_STATUS_ERROR } from '../../../../../utils/antd.constants';
import { getMachineProfileErrors } from '../../../../../utils/profiles/get.machine.profile.errors';
import type { MachineProfile } from '../../../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfileFieldError } from '../../../../../utils/profiles/interfaces/MachineProfileFieldError';
import { MachineProfileSaved, selectActiveMachineProfile } from '../../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../../utils/states/new.store';
import { IconNumberField } from '../../../../../views/IconNumberField';
import styles from './styles.module.scss';

type FrameNumberField = keyof Pick<MachineProfile, 'frameMarginMm' | 'frameFeedMmPerMin'>;

interface FrameNumberInputProps {
  /** The profile field the number is saved to. */
  field: FrameNumberField;
  /** Id of the input, which the label points at. */
  inputId: string;
  /** Localization key of the label. */
  labelKey: string;
  iconComponent: ReactNode;
  /** Localization key of the short visible name beside the icon. */
  captionKey: string;
  /** Localization key of the unit after the value. */
  unitKey: string;
  /** The value in use, shown while the user has typed nothing. */
  savedValue: number;
  /** True while a run keeps the settings fixed. */
  isDisabled: boolean;
}

export const FrameNumberInput = ({
  field,
  inputId,
  labelKey,
  iconComponent,
  captionKey,
  unitKey,
  savedValue,
  isDisabled,
}: FrameNumberInputProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [draftValue, setDraftValue] = useState<number | undefined>(undefined);
  const [fieldError, setFieldError] = useState<MachineProfileFieldError | undefined>(undefined);
  const errorId: string = `${inputId}-error`;

  const saveDraftValue = (): void => {
    // eslint-disable-next-line no-restricted-syntax -- a draft of 0 is a real value, distinct from no draft
    if (!activeProfile || draftValue === undefined) {
      setFieldError(undefined);

      return;
    }

    const profile: MachineProfile = { ...activeProfile, [field]: draftValue };
    const foundError: MachineProfileFieldError | undefined = getMachineProfileErrors(profile).find(
      (profileError: MachineProfileFieldError): boolean => profileError.field === field,
    );

    setFieldError(foundError);

    if (foundError) {
      return;
    }

    setDraftValue(undefined);
    dispatch(new MachineProfileSaved({ profile }));
  };

  return (
    <div className={styles.frameNumber}>
      <IconNumberField
        inputId={inputId}
        labelText={t(labelKey)}
        iconComponent={iconComponent}
        captionText={t(captionKey)}
        unitText={t(unitKey)}
        status={fieldError ? ANTD_INPUT_NUMBER_STATUS_ERROR : undefined}
        aria-describedby={fieldError ? errorId : undefined}
        disabled={!activeProfile || isDisabled}
        value={draftValue ?? savedValue}
        onChange={(typedValue: number | null): void => setDraftValue(typedValue ?? undefined)}
        onBlur={saveDraftValue}
        onPressEnter={saveDraftValue}
      />
      {fieldError && (
        <p id={errorId} role="alert" className={styles.error}>
          {t(fieldError.messageKey, fieldError.messageParameters)}
        </p>
      )}
    </div>
  );
};
