/**
 * Tells whether a value is a material: text id and name, a thickness in range, and only well-formed test results.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isOptionalFiniteNumber } from '../type.guards/is.optional.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { Material } from './interfaces/Material';
import type { MaterialTestResult } from './interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from './material.constants';

const MATERIAL_TEST_OUTCOMES: readonly unknown[] = Object.values(MATERIAL_TEST_OUTCOME);

const isMaterialTestResult = (value: unknown): value is MaterialTestResult =>
  isRecord(value) &&
  isString(value.machineProfileId) &&
  isFiniteNumber(value.powerPercent) &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isFiniteNumber(value.thicknessMm) &&
  MATERIAL_TEST_OUTCOMES.includes(value.outcome) &&
  isOptionalFiniteNumber(value.depthMm) &&
  isString(value.testedAtIso);

export const isMaterial = (value: unknown): value is Material =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isFiniteNumber(value.thicknessMm) &&
  Array.isArray(value.testResults) &&
  value.testResults.every(isMaterialTestResult);
