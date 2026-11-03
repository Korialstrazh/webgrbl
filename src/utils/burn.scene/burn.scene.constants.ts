/**
 * Colours, lights and limits of the 3D preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WOOD_BED_COLOUR } from '../bed/bed.colour.constants';

/** The colour of clean material, the same plywood the bed colour picker offers. */
export const BURN_SCENE_CLEAN_COLOUR = WOOD_BED_COLOUR;
/** The colour of fully burnt material; a vertex shade of 0 to 1 moves from the clean colour to this. */
export const BURN_SCENE_BURNT_COLOUR = '#17110c';
export const BURN_SCENE_BACKGROUND_COLOUR = '#1a1d21';
export const BURN_SCENE_AMBIENT_LIGHT_COLOUR = '#ffffff';
export const BURN_SCENE_AMBIENT_LIGHT_INTENSITY = 1.6;
export const BURN_SCENE_KEY_LIGHT_COLOUR = '#ffffff';
export const BURN_SCENE_KEY_LIGHT_INTENSITY = 1.8;
/** Direction towards the key light, chosen so that the two visible walls of a cut differ in brightness. */
export const BURN_SCENE_KEY_LIGHT_DIRECTION: readonly [number, number, number] = [-0.5, -1, 2];

/** Sharper than this only costs battery: the eye cannot see it on a preview. */
export const BURN_SCENE_MAX_PIXEL_RATIO = 2;
/** Direction from the sheet to the camera at the start: from the front, a little to the side, and above. */
export const BURN_SCENE_CAMERA_DIRECTION: readonly [number, number, number] = [0.35, -1, 1.1];
/** Room around the framed sheet, as a share of its size. */
export const BURN_SCENE_FRAME_MARGIN_RATIO = 1.05;
/** The camera stands this many frame radiuses from the sheet, so nothing crosses the near plane while orbiting. */
export const BURN_SCENE_CAMERA_DISTANCE_RADIUSES = 4;
/** Stops the orbit at the horizon: the underside of the sheet shows nothing worth seeing. */
export const BURN_SCENE_MAX_POLAR_ANGLE_RADIANS = Math.PI / 2;
/** A pointer that moved further than this between press and release dragged the scene instead of clicking. */
export const BURN_SCENE_CLICK_MAX_MOVE_PX = 4;

/** The names three.js looks up the mesh data by. */
export const BURN_SCENE_ATTRIBUTE = {
  POSITION: 'position',
  COLOUR: 'color',
} as const;

export const BURN_SCENE_POSITION_VALUES_PER_VERTEX = 3;
export const BURN_SCENE_COLOUR_VALUES_PER_VERTEX = 3;
export const BURN_SCENE_INDEX_VALUES_PER_ITEM = 1;
export const BURN_SCENE_CONTROLS_CHANGE_EVENT = 'change';
