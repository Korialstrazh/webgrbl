/**
 * The end-of-job cut check: after a job finished normally, a hint not to move the sheet yet and to test a part first,
 * asking whether the parts came out cleanly. It never locks anything: Yes or close hide it, and Some are stuck offers
 * to run the line layers again. Some are stuck also puts a note on the material preset of each layer ticked at first
 * that is still linked to one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CloseOutlined, WarningOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { JobCutCheckLayer } from '../../utils/states/interfaces/JobCutCheckLayer';
import { selectJobCutCheckLayers } from '../../utils/states/job.cut.check.selector';
import { JobCutCheckDismissed } from '../../utils/states/job.run.state';
import { MaterialPresetCutThroughNoteAdded } from '../../utils/states/material.preset.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { IconActionButton } from '../../views/IconActionButton';
import { JobCutCheckRecutForm } from './JobCutCheckRecutForm';
import styles from './styles.module.scss';

export const JobCutCheckHint = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: JobCutCheckLayer[] = useSelector(selectJobCutCheckLayers);
  const [isStuckAnswered, setIsStuckAnswered] = useState<boolean>(false);

  if (!layers.length) {
    return null;
  }

  const dismissHint = (): void => {
    setIsStuckAnswered(false);
    dispatch(new JobCutCheckDismissed());
  };

  const answerStuck = (): void => {
    if (!isStuckAnswered) {
      for (const { isTickedByDefault, presetId } of layers) {
        if (isTickedByDefault && presetId) {
          dispatch(new MaterialPresetCutThroughNoteAdded({ presetId }));
        }
      }
    }

    setIsStuckAnswered(true);
  };

  return (
    <section className={styles.cutCheckHint} aria-label={t(DEFAULT.JOB_CUT_CHECK_QUESTION)}>
      <div className={styles.header}>
        <WarningOutlined className={styles.icon} aria-hidden />
        <p className={styles.title}>{t(DEFAULT.JOB_CUT_CHECK_TITLE)}</p>
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(DEFAULT.JOB_CUT_CHECK_CLOSE)}
          iconComponent={<CloseOutlined />}
          onClick={dismissHint}
        />
      </div>
      <p className={styles.question}>{t(DEFAULT.JOB_CUT_CHECK_QUESTION)}</p>
      <div className={styles.answers}>
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={dismissHint}>{t(DEFAULT.JOB_CUT_CHECK_YES)}</Button>
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={answerStuck}>{t(DEFAULT.JOB_CUT_CHECK_STUCK)}</Button>
      </div>
      {isStuckAnswered && <JobCutCheckRecutForm layers={layers} />}
    </section>
  );
};
