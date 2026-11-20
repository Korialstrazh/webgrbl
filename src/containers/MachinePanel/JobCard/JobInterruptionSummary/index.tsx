/**
 * Where an interrupted job stopped: the layer, how far through the program, and the last point the laser confirmed.
 * It shows next to the stopped status after a lost connection, reset, alarm or Stop of a job, and tells nothing for
 * a frame run.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getLayerDisplayName } from '../../../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { getJobInterruptionSummary } from '../../../../utils/states/get.job.interruption.summary';
import type { JobInterruptionSummary as JobInterruptionSummaryData }
  from '../../../../utils/states/interfaces/JobInterruptionSummary';
import type { JobResumeState } from '../../../../utils/states/interfaces/JobResumeState';
import { selectJobResume } from '../../../../utils/states/job.resume.state';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import type { JobRunKind } from '../../../../utils/states/job.run.kind.constants';
import { selectJobRunKind, selectJobRunStatus } from '../../../../utils/states/job.run.state';
import { JOB_RUN_STATUS } from '../../../../utils/states/job.run.status.constants';
import type { JobRunStatus } from '../../../../utils/states/job.run.status.constants';
import { selectPaletteEntries } from '../../../../utils/states/palette.state';
import { selectProjectLayers } from '../../../../utils/states/project.document.state';
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';
import styles from './styles.module.scss';

const LAST_POINT_FRACTION_DIGITS = 1;

export const JobInterruptionSummary = (): ReactNode => {
  const { t } = useTranslation();
  const resume: JobResumeState | undefined = useSelector(selectJobResume);
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const runStatus: JobRunStatus = useSelector(selectJobRunStatus);
  const runKind: JobRunKind = useSelector(selectJobRunKind);
  const isJobInterrupted: boolean = runStatus === JOB_RUN_STATUS.INTERRUPTED && runKind === JOB_RUN_KIND.JOB;

  const summary: JobInterruptionSummaryData | undefined = useMemo(() => {
    if (!resume) {
      return undefined;
    }

    const layerNames: Record<string, string> = {};

    for (const layer of layers) {
      layerNames[getLayerKey(layer)] = getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries));
    }

    return getJobInterruptionSummary(resume, layerNames);
  }, [resume, layers, paletteEntries]);

  if (!isJobInterrupted || !summary) {
    return null;
  }

  return (
    <div className={styles.interruptionSummary} role="status">
      <p className={styles.line}>
        {t(DEFAULT.JOB_INTERRUPTED_STOPPED_AT, { layer: summary.layerName, percent: summary.percent })}
      </p>
      <p className={styles.line}>
        {t(DEFAULT.JOB_INTERRUPTED_LAST_POINT, {
          x: summary.lastPoint.x.toFixed(LAST_POINT_FRACTION_DIGITS),
          y: summary.lastPoint.y.toFixed(LAST_POINT_FRACTION_DIGITS),
        })}
      </p>
    </div>
  );
};
