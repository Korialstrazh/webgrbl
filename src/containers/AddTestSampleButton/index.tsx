/**
 * Adds the 5 x 5 cm test sample to the project from the Layers panel. It is off, with the reason, when the sample
 * does not fit the machine or the project is full.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import { fitsSampleJob } from '../../utils/materials/fits.sample.job';
import { MAX_PROJECT_OBJECTS } from '../../utils/project/project.constants';
import type { AppDispatch } from '../../utils/states/new.store';
import { SampleJobAddRequested, selectProjectObjects } from '../../utils/states/project.document.state';
import { selectToolpathMachineArea } from '../../utils/states/toolpath.machine.area.selector';

const getBlockedReasonKey = (fitsMachine: boolean, isProjectFull: boolean): string | undefined => {
  if (!fitsMachine) {
    return DEFAULT.ADD_TEST_SAMPLE_TOO_SMALL;
  }

  return isProjectFull ? DEFAULT.ADD_TEST_SAMPLE_PROJECT_FULL : undefined;
};

export const AddTestSampleButton = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const fitsMachine: boolean = fitsSampleJob(useSelector(selectToolpathMachineArea));
  const isProjectFull: boolean = useSelector(selectProjectObjects).length >= MAX_PROJECT_OBJECTS;
  const blockedReasonKey: string | undefined = getBlockedReasonKey(fitsMachine, isProjectFull);
  const blockedReason: string | undefined = blockedReasonKey && t(blockedReasonKey);

  return (
    <Tooltip title={blockedReason}>
      <Button
        block
        disabled={!!blockedReason}
        aria-description={blockedReason}
        onClick={() => dispatch(new SampleJobAddRequested())}
      >
        {t(DEFAULT.ADD_TEST_SAMPLE)}
      </Button>
    </Tooltip>
  );
};
