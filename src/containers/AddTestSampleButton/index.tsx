/**
 * Adds the 5 x 5 cm test sample to the project, as a labelled button or an icon only. It is off, with the reason, when
 * the sample does not fit the machine or the project is full.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { fitsSampleJob } from '../../utils/materials/fits.sample.job';
import { MAX_PROJECT_OBJECTS } from '../../utils/project/project.constants';
import type { AppDispatch } from '../../utils/states/new.store';
import { SampleJobAddRequested, selectProjectObjects } from '../../utils/states/project.document.state';
import { selectToolpathMachineArea } from '../../utils/states/toolpath.machine.area.selector';
import { IconActionButton } from '../../views/IconActionButton';
import { TestSampleIcon } from '../../views/TestSampleIcon';

interface AddTestSampleButtonProps {
  isIconOnly?: boolean;
}

const getBlockedReasonKey = (fitsMachine: boolean, isProjectFull: boolean): string | undefined => {
  if (!fitsMachine) {
    return DEFAULT.ADD_TEST_SAMPLE_TOO_SMALL;
  }

  return isProjectFull ? DEFAULT.ADD_TEST_SAMPLE_PROJECT_FULL : undefined;
};

export const AddTestSampleButton = ({ isIconOnly = false }: AddTestSampleButtonProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const fitsMachine: boolean = fitsSampleJob(useSelector(selectToolpathMachineArea));
  const isProjectFull: boolean = useSelector(selectProjectObjects).length >= MAX_PROJECT_OBJECTS;
  const blockedReasonKey: string | undefined = getBlockedReasonKey(fitsMachine, isProjectFull);
  const blockedReason: string | undefined = blockedReasonKey && t(blockedReasonKey);
  const addSample = (): void => {
    dispatch(new SampleJobAddRequested());
  };

  if (isIconOnly) {
    return (
      <IconActionButton
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={t(DEFAULT.ADD_TEST_SAMPLE)}
        iconComponent={<TestSampleIcon />}
        blockedReasonText={blockedReason}
        onClick={addSample}
      />
    );
  }

  return (
    <Tooltip title={blockedReason}>
      <Button
        icon={<TestSampleIcon aria-hidden />}
        disabled={!!blockedReason}
        aria-description={blockedReason}
        onClick={addSample}
      >
        {t(DEFAULT.ADD_TEST_SAMPLE)}
      </Button>
    </Tooltip>
  );
};
