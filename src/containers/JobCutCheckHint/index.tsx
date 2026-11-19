/**
 * The end-of-job cut check: after a job finished normally, a hint not to move the sheet yet and to test a part first,
 * asking whether the parts came out cleanly. It never locks anything: Yes or close hide it, and Some are stuck offers
 * to run the line layers again. After Some are stuck, the layers ticked when the user runs them again or closes the
 * hint put a note on the material preset they are still linked to, once per answer.
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
import { JobSafetyChecklistOpened } from '../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../utils/states/job.start.request.constants';
import { MaterialPresetCutThroughNoteAdded } from '../../utils/states/material.preset.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { IconActionButton } from '../../views/IconActionButton';
import { JobCutCheckRecutForm } from './JobCutCheckRecutForm';
import styles from './styles.module.scss';

const getDefaultTickedLayerKeys = (layers: JobCutCheckLayer[]): string[] =>
  layers
    .filter(({ isTickedByDefault }: JobCutCheckLayer): boolean => isTickedByDefault)
    .map(({ layerKey }: JobCutCheckLayer): string => layerKey);

const isLinkedTickedLayer = ({ layerKey, presetId }: JobCutCheckLayer, tickedLayerKeys: string[]): boolean =>
  Boolean(presetId) && tickedLayerKeys.includes(layerKey);

export const JobCutCheckHint = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: JobCutCheckLayer[] = useSelector(selectJobCutCheckLayers);
  const [isStuckAnswered, setIsStuckAnswered] = useState<boolean>(false);
  const [isNoteAdded, setIsNoteAdded] = useState<boolean>(false);
  const [tickedLayerKeys, setTickedLayerKeys] = useState<string[]>([]);

  if (!layers.length) {
    return null;
  }

  /** Notes the presets of the ticked layers, once per Some are stuck answer. */
  const addCutThroughNotes = (): void => {
    const isNoteDue: boolean = isStuckAnswered && !isNoteAdded;

    if (!isNoteDue) {
      return;
    }

    for (const layer of layers) {
      if (layer.presetId && isLinkedTickedLayer(layer, tickedLayerKeys)) {
        dispatch(new MaterialPresetCutThroughNoteAdded({ presetId: layer.presetId }));
      }
    }

    setIsNoteAdded(true);
  };

  const dismissHint = (): void => {
    addCutThroughNotes();
    setIsStuckAnswered(false);
    setIsNoteAdded(false);
    dispatch(new JobCutCheckDismissed());
  };

  const answerStuck = (): void => {
    if (!isStuckAnswered) {
      setTickedLayerKeys(getDefaultTickedLayerKeys(layers));
      setIsNoteAdded(false);
      setIsStuckAnswered(true);
    }
  };

  const tickLayer = (layerKey: string, isTicked: boolean): void => {
    setTickedLayerKeys((currentKeys: string[]): string[] =>
      isTicked ? [...currentKeys, layerKey] : currentKeys.filter((key: string): boolean => key !== layerKey));
  };

  const recutLayers = (layerKeys: string[], isExtraPassAdded: boolean): void => {
    addCutThroughNotes();
    dispatch(new JobSafetyChecklistOpened({ kind: JOB_START_REQUEST_KIND.RECUT, layerKeys, isExtraPassAdded }));
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
      {isStuckAnswered && (
        <JobCutCheckRecutForm
          layers={layers}
          tickedLayerKeys={tickedLayerKeys}
          onLayerTick={tickLayer}
          onRecut={recutLayers}
        />
      )}
    </section>
  );
};
