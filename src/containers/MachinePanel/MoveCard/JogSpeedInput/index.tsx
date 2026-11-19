/**
 * The jog speed field: shows the active profile jog feed rate and saves a change on blur or Enter.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { InputNumber } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_INPUT_NUMBER_PRECISION_INTEGER } from '../../../../utils/antd.constants';
import { getCommittedNumber } from '../../../../utils/get.committed.number';
import { useNumberFieldDraft } from '../../../../utils/hooks/use.number.field.draft';
import type { NumberFieldDraftControls } from '../../../../utils/hooks/use.number.field.draft';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import {
  DEFAULT_MACHINE_JOG_FEED_RATE,
  MACHINE_JOG_FEED_RATE_MAX,
  MACHINE_JOG_FEED_RATE_MIN,
} from '../../../../utils/profiles/machine.profile.constants';
import { MachineProfileSaved, selectActiveMachineProfile } from '../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../utils/states/new.store';
import styles from './styles.module.scss';

export const JogSpeedInput = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const savedFeedRate: number = activeProfile?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE;
  const { fieldValue, typedValue, changeDraft, clearDraft }: NumberFieldDraftControls =
    useNumberFieldDraft(savedFeedRate);

  // Only blur and Enter correct the field: an empty or unfinished draft never snaps back while the user types, and
  // never reaches the profile; a number outside the limits is held inside them.
  const saveDraftFeedRate = (): void => {
    const jogFeedRate: number | undefined =
      getCommittedNumber(typedValue, MACHINE_JOG_FEED_RATE_MIN, MACHINE_JOG_FEED_RATE_MAX);

    clearDraft();

    if (activeProfile && jogFeedRate && jogFeedRate !== activeProfile.jogFeedRate) {
      dispatch(new MachineProfileSaved({ profile: { ...activeProfile, jogFeedRate } }));
    }
  };

  return (
    <InputNumber
      className={styles.jogSpeedInput}
      aria-label={t(DEFAULT.MACHINE_MOVE_JOG_SPEED_LABEL)}
      disabled={!activeProfile}
      // No min or max here: the input would drop a number past them silently; blur holds it inside the limits.
      precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
      suffix={t(DEFAULT.MACHINE_MOVE_JOG_SPEED_UNIT)}
      value={fieldValue}
      changeOnBlur={false}
      onChange={changeDraft}
      onBlur={saveDraftFeedRate}
      onPressEnter={saveDraftFeedRate}
    />
  );
};
