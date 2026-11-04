/**
 * The frame margin of the active machine profile: a number the user types, saved once it is valid.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { InputNumber } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_INPUT_NUMBER_STATUS_ERROR } from '../../../../../utils/antd.constants';
import { DEFAULT } from '../../../../../utils/localization/default.locales';
import { getMachineProfileErrors } from '../../../../../utils/profiles/get.machine.profile.errors';
import type { MachineProfile } from '../../../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfileFieldError } from '../../../../../utils/profiles/interfaces/MachineProfileFieldError';
import { MachineProfileSaved, selectActiveMachineProfile } from '../../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../../utils/states/new.store';
import styles from './styles.module.scss';

const FRAME_MARGIN_FIELD = 'frameMarginMm';
const FRAME_MARGIN_INPUT_ID = 'frame-margin-input';
const FRAME_MARGIN_ERROR_ID = 'frame-margin-error';

interface FrameMarginInputProps {
  /** True while a run keeps the settings fixed. */
  isDisabled: boolean;
}

export const FrameMarginInput = ({ isDisabled }: FrameMarginInputProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [draftMarginMm, setDraftMarginMm] = useState<number | undefined>(undefined);
  const [errorMessageKey, setErrorMessageKey] = useState<string | undefined>(undefined);

  const saveDraftMargin = (): void => {
    // eslint-disable-next-line no-restricted-syntax -- a draft of 0 is a real margin, distinct from no draft
    if (!activeProfile || draftMarginMm === undefined) {
      setErrorMessageKey(undefined);

      return;
    }

    const profile: MachineProfile = { ...activeProfile, frameMarginMm: draftMarginMm };
    const marginError: MachineProfileFieldError | undefined = getMachineProfileErrors(profile).find(
      (profileError: MachineProfileFieldError): boolean => profileError.field === FRAME_MARGIN_FIELD,
    );

    setErrorMessageKey(marginError?.messageKey);

    if (marginError) {
      return;
    }

    setDraftMarginMm(undefined);
    dispatch(new MachineProfileSaved({ profile }));
  };

  return (
    <div className={styles.frameMargin}>
      <label htmlFor={FRAME_MARGIN_INPUT_ID}>{t(DEFAULT.FRAME_MARGIN_LABEL)}</label>
      <InputNumber
        id={FRAME_MARGIN_INPUT_ID}
        status={errorMessageKey ? ANTD_INPUT_NUMBER_STATUS_ERROR : undefined}
        aria-describedby={errorMessageKey ? FRAME_MARGIN_ERROR_ID : undefined}
        disabled={!activeProfile || isDisabled}
        value={draftMarginMm ?? activeProfile?.frameMarginMm ?? 0}
        onChange={(marginMm: number | null): void => setDraftMarginMm(marginMm ?? undefined)}
        onBlur={saveDraftMargin}
        onPressEnter={saveDraftMargin}
      />
      {errorMessageKey && <p id={FRAME_MARGIN_ERROR_ID} role="alert" className={styles.error}>{t(errorMessageKey)}</p>}
    </div>
  );
};
