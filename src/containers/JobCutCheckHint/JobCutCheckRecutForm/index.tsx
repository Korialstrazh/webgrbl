/**
 * The re-cut form of the end-of-job cut check: a tick per line layer, Cut layers ticked at first, an optional extra
 * pass, and Run cut layers again, which goes through the normal Start checklist at the same work zero.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Button, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { JobCutCheckLayer } from '../../../utils/states/interfaces/JobCutCheckLayer';
import { JobSafetyChecklistOpened } from '../../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../../utils/states/job.start.request.constants';
import type { AppDispatch } from '../../../utils/states/new.store';
import type { JobCutCheckRecutFormProps } from '../interfaces/JobCutCheckRecutFormProps';
import styles from '../styles.module.scss';

const getDefaultTickedLayerKeys = (layers: JobCutCheckLayer[]): string[] =>
  layers
    .filter(({ isTickedByDefault }: JobCutCheckLayer): boolean => isTickedByDefault)
    .map(({ layerKey }: JobCutCheckLayer): string => layerKey);

export const JobCutCheckRecutForm = ({ layers }: JobCutCheckRecutFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [tickedLayerKeys, setTickedLayerKeys] = useState<string[]>(() => getDefaultTickedLayerKeys(layers));
  const [isExtraPassAdded, setIsExtraPassAdded] = useState<boolean>(false);
  // In burn order, as the layers are listed, whatever order they were ticked in.
  const recutLayerKeys: string[] = layers
    .map(({ layerKey }: JobCutCheckLayer): string => layerKey)
    .filter((layerKey: string): boolean => tickedLayerKeys.includes(layerKey));
  const hasTickedLayer: boolean = recutLayerKeys.length > 0;

  const toggleLayer = (layerKey: string, isTicked: boolean): void => {
    setTickedLayerKeys((currentKeys: string[]): string[] =>
      isTicked ? [...currentKeys, layerKey] : currentKeys.filter((key: string): boolean => key !== layerKey));
  };

  return (
    <div className={styles.recutForm}>
      <p className={styles.layersLabel}>{t(DEFAULT.JOB_CUT_CHECK_LAYERS_LABEL)}</p>
      {layers.map(({ layerKey, name }: JobCutCheckLayer) => (
        <Checkbox
          key={layerKey}
          checked={tickedLayerKeys.includes(layerKey)}
          onChange={(changeEvent: CheckboxChangeEvent) => toggleLayer(layerKey, changeEvent.target.checked)}
        >
          {name}
        </Checkbox>
      ))}
      <Checkbox
        checked={isExtraPassAdded}
        onChange={(changeEvent: CheckboxChangeEvent) => setIsExtraPassAdded(changeEvent.target.checked)}
      >
        {t(DEFAULT.JOB_CUT_CHECK_EXTRA_PASS)}
      </Checkbox>
      <Button
        type={ANTD_BUTTON_TYPE_PRIMARY}
        size={ANTD_BUTTON_SIZE_SMALL}
        disabled={!hasTickedLayer}
        title={hasTickedLayer ? undefined : t(DEFAULT.JOB_CUT_CHECK_RECUT_NEEDS_LAYER)}
        onClick={() => dispatch(new JobSafetyChecklistOpened({
          kind: JOB_START_REQUEST_KIND.RECUT,
          layerKeys: recutLayerKeys,
          isExtraPassAdded,
        }))}
      >
        {t(DEFAULT.JOB_CUT_CHECK_RECUT)}
      </Button>
      {!hasTickedLayer && <p className={styles.recutNote}>{t(DEFAULT.JOB_CUT_CHECK_RECUT_NEEDS_LAYER)}</p>}
    </div>
  );
};
