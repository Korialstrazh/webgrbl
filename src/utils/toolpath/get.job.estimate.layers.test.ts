import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getSampleJobLayers } from '../materials/get.sample.job.layers';
import { getSampleJobObject } from '../materials/get.sample.job.object';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { getBedDrawables } from './get.bed.drawables';
import { getMachineMotionLimits } from './get.machine.motion.limits';
import { getMotionTimeline } from './get.motion.timeline';
import { getToolpath } from './get.toolpath';
import { getToolpathLayerBurnTimes } from './get.toolpath.layer.burn.times';
import type { Toolpath } from './interfaces/Toolpath';
import { newToolpathMachineArea } from './test.support/new.toolpath.machine.area';

const IMPORT_SVG_TEXT: string = '<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" '
  + 'viewBox="0 0 120 80"><rect x="5" y="5" width="110" height="70" fill="none" stroke="#ff0000"/>'
  + '<circle cx="40" cy="40" r="20" fill="#000000"/><path d="M70 20 L110 20 L90 60 Z" fill="none" '
  + 'stroke="#0000ff"/></svg>';
const SECONDS_PER_MINUTE = 60;
const IMPORT_FILL_S = 434;
const IMPORT_CUT_S = 216;
const IMPORT_SCORE_S = 5;
const SAMPLE_SHADING_S = 539;
const SAMPLE_CUT_S = 120;

const getJob = (objects: ProjectObject[], layers: ProjectLayer[]): { totalTimeS: number; layerTimesS: number[] } => {
  const { drawables, warnings } = getBedDrawables({ objects, layers });
  const toolpath: Toolpath = getToolpath({ drawables, warnings, layers, machineArea: newToolpathMachineArea() });
  const timeline = getMotionTimeline(toolpath, getMachineMotionLimits({}));

  return {
    totalTimeS: timeline.totalTimeS,
    layerTimesS: getToolpathLayerBurnTimes(toolpath, timeline).map(({ burnTimeS }): number => burnTimeS),
  };
};

/**
 * The 120 x 80 mm import and the 50 x 50 mm test sample both take about 11 minutes on the default settings. This is
 * the time model, not a stale readout: the import's longer three-pass cut makes up for its smaller filled circle.
 */
describe('job estimate of the import and the test sample', () => {
  const importObject: ProjectObject = newProjectObject({
    svgText: IMPORT_SVG_TEXT,
    intrinsicWidthMm: 120,
    intrinsicHeightMm: 80,
    widthMm: 120,
    heightMm: 80,
  });
  const sampleObject: ProjectObject = getSampleJobObject(newToolpathMachineArea());
  const importJob = getJob([importObject], getObjectsDerivedLayers([importObject], DEFAULT_PALETTE, []));
  const sampleJob = getJob([sampleObject], getSampleJobLayers([sampleObject], DEFAULT_PALETTE, []));

  it('spends the import mostly on its fill and its three-pass cut', () => {
    expect(importJob.layerTimesS.map(Math.round)).toEqual([IMPORT_FILL_S, IMPORT_CUT_S, IMPORT_SCORE_S]);
  });

  it('spends the test sample mostly on its shading', () => {
    expect(sampleJob.layerTimesS.map(Math.round)).toEqual([SAMPLE_SHADING_S, SAMPLE_CUT_S]);
  });

  it('lands both jobs between 10 and 12 minutes', () => {
    for (const { totalTimeS } of [importJob, sampleJob]) {
      expect(totalTimeS / SECONDS_PER_MINUTE).toBeGreaterThan(10);
      expect(totalTimeS / SECONDS_PER_MINUTE).toBeLessThan(12);
    }
  });
});
