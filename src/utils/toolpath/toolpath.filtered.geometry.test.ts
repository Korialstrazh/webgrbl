import { describe, expect, it } from 'vitest';
import { getBurnDoseGrid } from '../burn.model/get.burn.dose.grid';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import { newProjectObject } from '../project/new.project.object';
import { SVG_NAMESPACE_URI } from '../svg/svg.constants';
import { SVG_TREE_DISABLED_ATTRIBUTE_NAME, SVG_TREE_DISABLED_ATTRIBUTE_VALUE } from '../svg/tree/svg.tree.constants';
import { getBedDrawables } from './get.bed.drawables';
import { getGcodeText } from './get.gcode.text';
import { getToolpath } from './get.toolpath';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMachineArea } from './interfaces/ToolpathMachineArea';
import { newToolpathMachineArea } from './test.support/new.toolpath.machine.area';

const RED = '#ff0000';
const BLUE = '#0000ff';
const OBJECT_SIZE_MM = 100;
const KEPT_SHAPE = '<rect x="10" y="10" width="20" height="20" fill="none" stroke="#ff0000"/>';
const SKIPPED_SHAPE = `<rect x="60" y="60" width="30" height="30" fill="none" stroke="#ff0000" `
  + `${SVG_TREE_DISABLED_ATTRIBUTE_NAME}="${SVG_TREE_DISABLED_ATTRIBUTE_VALUE}"/>`;
const HIDDEN_LAYER_SHAPE = '<circle cx="70" cy="20" r="10" fill="none" stroke="#0000ff"/>';

const getLayers = (): ProjectLayer[] => [
  getNewLayer(RED, DEFAULT_PALETTE, 0),
  { ...getNewLayer(BLUE, DEFAULT_PALETTE, 1), enabled: false },
];

/** The toolpath of one 100 x 100 mm object whose SVG has a 100 x 100 viewBox. */
const getObjectToolpath = (content: string, machineArea: ToolpathMachineArea): Toolpath => {
  const { drawables, warnings }: BedDrawableSet = getBedDrawables({
    objects: [newProjectObject({
      svgText: `<svg xmlns="${SVG_NAMESPACE_URI}" width="100mm" height="100mm" viewBox="0 0 100 100">${content}</svg>`,
      intrinsicWidthMm: OBJECT_SIZE_MM,
      intrinsicHeightMm: OBJECT_SIZE_MM,
      widthMm: OBJECT_SIZE_MM,
      heightMm: OBJECT_SIZE_MM,
    })],
    layers: [],
  });

  return getToolpath({ drawables, warnings, layers: getLayers(), machineArea });
};

const newGcodeContext = (machineArea: ToolpathMachineArea): GcodeContext => ({
  ...machineArea,
  projectName: 'Filtered',
  profileName: 'My laser',
  sValueMax: 1000,
  hasAirAssist: false,
  appVersion: '0.1.0',
  createdAtIso: '2026-11-10T00:00:00.000Z',
});

describe('toolpath filtered geometry', () => {
  const machineArea: ToolpathMachineArea = newToolpathMachineArea();
  const filteredToolpath: Toolpath = getObjectToolpath(
    `${KEPT_SHAPE}${SKIPPED_SHAPE}${HIDDEN_LAYER_SHAPE}`,
    machineArea,
  );
  const keptOnlyToolpath: Toolpath = getObjectToolpath(KEPT_SHAPE, machineArea);

  it('leaves skipped nodes and hidden layers out of the toolpath', () => {
    expect(keptOnlyToolpath.moves.length).toBeGreaterThan(0);
    expect(filteredToolpath.moves).toEqual(keptOnlyToolpath.moves);
    expect(filteredToolpath.bounds).toEqual(keptOnlyToolpath.bounds);
  });

  it('leaves skipped nodes and hidden layers out of the G-code', () => {
    const context: GcodeContext = newGcodeContext(machineArea);

    expect(getGcodeText(filteredToolpath, context)).toBe(getGcodeText(keptOnlyToolpath, context));
  });

  it('leaves skipped nodes and hidden layers out of the 3D burn input', () => {
    expect(getBurnDoseGrid(filteredToolpath, getLayers())).toEqual(getBurnDoseGrid(keptOnlyToolpath, getLayers()));
  });
});
