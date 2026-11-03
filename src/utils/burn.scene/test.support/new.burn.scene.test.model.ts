/**
 * A burn model of real cuts for scene tests: a 10 mm square cut through at a tested setting, with a 4 mm square cut
 * through inside it, on a 3 mm sheet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getBurnModel } from '../../burn.model/get.burn.model';
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';
import { getTestJobToolpath } from '../../burn.model/test.support/get.test.job.toolpath';
import { newStrokedDrawable } from '../../burn.model/test.support/new.stroked.drawable';
import { newTestLayer } from '../../burn.model/test.support/new.test.layer';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import { MATERIAL_TEST_OUTCOME } from '../../materials/material.constants';
import { newTestResultFixture } from '../../materials/new.test.result.fixture';
import { getBoxSubpath } from '../../toolpath/test.support/get.box.subpath';

const LAYER_COLOUR = '#ff0000';
const FULL_POWER_PERCENT = 100;
const TEST_SPEED_MM_PER_MIN = 300;

export const BURN_SCENE_TEST_THICKNESS_MM = 3;

export const newBurnSceneTestModel = (): BurnModel => {
  const layers: ProjectLayer[] = [newTestLayer(LAYER_COLOUR, {
    maxPowerPercent: FULL_POWER_PERCENT,
    speedMmPerMin: TEST_SPEED_MM_PER_MIN,
    passes: 1,
  })];
  const outerSquare = getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
  const innerSquare = getBoxSubpath({ minX: 13, minY: 13, maxX: 17, maxY: 17 });

  return getBurnModel({
    toolpath: getTestJobToolpath([newStrokedDrawable([outerSquare, innerSquare], LAYER_COLOUR)], layers),
    layers,
    thicknessMm: BURN_SCENE_TEST_THICKNESS_MM,
    testResult: newTestResultFixture({
      powerPercent: FULL_POWER_PERCENT,
      speedMmPerMin: TEST_SPEED_MM_PER_MIN,
      passes: 1,
      thicknessMm: BURN_SCENE_TEST_THICKNESS_MM,
      outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
    }),
  });
};
