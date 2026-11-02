/**
 * Groups design paths into runs: paths that follow each other in drawing order with the same paint role and layer share
 * a run, so the Design view styles a layer with one group and still keeps the drawing order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DESIGN_RUN_KEY_SEPARATOR } from './bed.design.constants';
import type { ObjectDesignPaint } from './interfaces/ObjectDesignPaint';
import type { ObjectDesignPaintRun } from './interfaces/ObjectDesignPaintRun';

const isSameRunPaint = (run: ObjectDesignPaintRun | undefined, paint: ObjectDesignPaint): run is ObjectDesignPaintRun =>
  !!run && run.role === paint.role && run.layerKey === paint.layerKey;

export const getDesignPaintRuns = (paints: ObjectDesignPaint[]): ObjectDesignPaintRun[] => {
  const runs: ObjectDesignPaintRun[] = [];

  for (const paint of paints) {
    const lastRun: ObjectDesignPaintRun | undefined = runs.at(-1);

    if (isSameRunPaint(lastRun, paint)) {
      lastRun.paints.push(paint);

      continue;
    }

    runs.push({
      runKey: [paint.role, paint.layerKey, runs.length].join(DESIGN_RUN_KEY_SEPARATOR),
      role: paint.role,
      layerKey: paint.layerKey,
      paints: [paint],
    });
  }

  return runs;
};
