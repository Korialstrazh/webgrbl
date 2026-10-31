/**
 * The jog speed field: shows the active profile jog feed rate and saves a change on blur or Enter.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { InputNumber } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_INPUT_NUMBER_PRECISION_INTEGER } from '../../../../utils/antd.constants';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { getClampedJogFeedRate } from '../../../../utils/machine/get.clamped.jog.feed.rate';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import {
  DEFAULT_MACHINE_JOG_FEED_RATE,
  MACHINE_JOG_FEED_RATE_MAX,
  MACHINE_JOG_FEED_RATE_MIN,
} from '../../../../utils/profiles/machine.profile.constants';
import { MachineProfileSaved, selectActiveMachineProfile } from '../../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../../utils/states/new.store';

export const JogSpeedInput = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [draftFeedRate, setDraftFeedRate] = useState<number | undefined>(undefined);
  const savedFeedRate: number = activeProfile?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE;

  const saveDraftFeedRate = (): void => {
    if (!activeProfile || !draftFeedRate) {
      return;
    }

    const jogFeedRate: number = getClampedJogFeedRate(draftFeedRate);

    setDraftFeedRate(undefined);

    if (jogFeedRate !== activeProfile.jogFeedRate) {
      dispatch(new MachineProfileSaved({ profile: { ...activeProfile, jogFeedRate } }));
    }
  };

  return (
    <InputNumber
      aria-label={t(DEFAULT.MACHINE_MOVE_JOG_SPEED_LABEL)}
      disabled={!activeProfile}
      min={MACHINE_JOG_FEED_RATE_MIN}
      max={MACHINE_JOG_FEED_RATE_MAX}
      precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
      suffix={t(DEFAULT.MACHINE_MOVE_JOG_SPEED_UNIT)}
      value={draftFeedRate ?? savedFeedRate}
      onChange={(feedRate: number | null): void => setDraftFeedRate(feedRate || undefined)}
      onBlur={saveDraftFeedRate}
      onPressEnter={saveDraftFeedRate}
    />
  );
};
