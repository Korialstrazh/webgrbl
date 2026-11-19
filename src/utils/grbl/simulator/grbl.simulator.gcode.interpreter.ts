/**
 * Interprets one prepared G-code line for the simulated controller: updates the modal state and describes the motion.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getArcLength } from './grbl.simulator.arc.length';
import {
  GRBL_SIMULATOR_ERROR_MISSING_VALUE_WORD,
  GRBL_SIMULATOR_ERROR_MODAL_GROUP_VIOLATION,
  GRBL_SIMULATOR_ERROR_NO_ARC_OFFSETS,
  GRBL_SIMULATOR_ERROR_UNDEFINED_FEED_RATE,
  GRBL_SIMULATOR_ERROR_UNSUPPORTED_COMMAND,
  GRBL_SIMULATOR_G_CODE,
  GRBL_SIMULATOR_MM_PER_INCH,
  GRBL_SIMULATOR_MS_PER_MINUTE,
  GRBL_SIMULATOR_MS_PER_SECOND,
  GRBL_SIMULATOR_M_CODE,
  GRBL_SIMULATOR_NOOP_G_CODES,
  GRBL_SIMULATOR_NOOP_M_CODES,
  GRBL_SIMULATOR_SETTING_MAX_RATE_X,
  GRBL_SIMULATOR_SETTING_MAX_RATE_Y,
  GRBL_SIMULATOR_WORD,
} from './grbl.simulator.constants';
import { GRBL_SIMULATOR_DEFAULT_SETTINGS } from './grbl.simulator.default.settings';
import { getParsedGcodeWords } from './grbl.simulator.gcode.word.parser';
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';
import type { GrblSimulatorGcodeError } from './interfaces/GrblSimulatorGcodeError';
import type { GrblSimulatorGcodeWord } from './interfaces/GrblSimulatorGcodeWord';
import type { GrblSimulatorInterpretedLine } from './interfaces/GrblSimulatorInterpretedLine';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';

type SimulatorSettings = Readonly<Record<number, string>>;
type GcodeWords = readonly GrblSimulatorGcodeWord[];
type ArcCenterOffset = Pick<GrblAxisPosition, 'x' | 'y'>;
type InterpretedLineOrError = GrblSimulatorInterpretedLine | GrblSimulatorGcodeError;

const MOTION_G_CODES: readonly number[] = [
  GRBL_SIMULATOR_G_CODE.RAPID,
  GRBL_SIMULATOR_G_CODE.LINEAR,
  GRBL_SIMULATOR_G_CODE.ARC_CLOCKWISE,
  GRBL_SIMULATOR_G_CODE.ARC_COUNTER_CLOCKWISE,
  GRBL_SIMULATOR_G_CODE.DWELL,
  GRBL_SIMULATOR_G_CODE.SET_OFFSET,
];
const STATE_G_CODES: readonly number[] = [
  GRBL_SIMULATOR_G_CODE.INCHES,
  GRBL_SIMULATOR_G_CODE.MILLIMETRES,
  GRBL_SIMULATOR_G_CODE.ABSOLUTE,
  GRBL_SIMULATOR_G_CODE.RELATIVE,
];
const MODAL_MOTION_G_CODES: readonly number[] = [
  GRBL_SIMULATOR_G_CODE.RAPID,
  GRBL_SIMULATOR_G_CODE.LINEAR,
  GRBL_SIMULATOR_G_CODE.ARC_CLOCKWISE,
  GRBL_SIMULATOR_G_CODE.ARC_COUNTER_CLOCKWISE,
];
const AXIS_WORD_LETTERS: readonly string[] = [GRBL_SIMULATOR_WORD.X, GRBL_SIMULATOR_WORD.Y, GRBL_SIMULATOR_WORD.Z];
const SUPPORTED_M_CODES: readonly number[] = Object.values(GRBL_SIMULATOR_M_CODE);
const AXIS_LETTERS: Readonly<Record<keyof GrblAxisPosition, string>> = {
  x: GRBL_SIMULATOR_WORD.X,
  y: GRBL_SIMULATOR_WORD.Y,
  z: GRBL_SIMULATOR_WORD.Z,
};

const hasWord = (words: GcodeWords, letter: string): boolean =>
  words.some((word: GrblSimulatorGcodeWord): boolean => word.letter === letter);

/** Value of the last word with this letter; 0 when the line has none, so call hasWord first where absence matters. */
const getWordValue = (words: GcodeWords, letter: string): number =>
  words.findLast((word: GrblSimulatorGcodeWord): boolean => word.letter === letter)?.value ?? 0;

const getWordNumbers = (words: GcodeWords, letter: string): number[] =>
  words
    .filter((word: GrblSimulatorGcodeWord): boolean => word.letter === letter)
    .map((word: GrblSimulatorGcodeWord): number => word.value);

const isMotionGCode = (gCode: number): boolean => MOTION_G_CODES.includes(gCode);

const isGCodeKnown = (gCode: number): boolean =>
  isMotionGCode(gCode) || STATE_G_CODES.includes(gCode) || GRBL_SIMULATOR_NOOP_G_CODES.includes(gCode);

const isMCodeKnown = (mCode: number): boolean =>
  SUPPORTED_M_CODES.includes(mCode) || GRBL_SIMULATOR_NOOP_M_CODES.includes(mCode);

const isLaserSwitchMCode = (mCode: number): boolean => SUPPORTED_M_CODES.includes(mCode);

const isModalMotionGCode = (gCode: number): boolean => MODAL_MOTION_G_CODES.includes(gCode);

const isAxisWord = (word: GrblSimulatorGcodeWord): boolean => AXIS_WORD_LETTERS.includes(word.letter);

const isArcGCode = (gCode: number): boolean =>
  gCode === GRBL_SIMULATOR_G_CODE.ARC_CLOCKWISE || gCode === GRBL_SIMULATOR_G_CODE.ARC_COUNTER_CLOCKWISE;

const hasMotionWords = (words: GcodeWords, gCode: number): boolean =>
  words.some(isAxisWord) ||
  (isArcGCode(gCode) && (hasWord(words, GRBL_SIMULATOR_WORD.I) || hasWord(words, GRBL_SIMULATOR_WORD.J)));

const getEffectiveLaserPower = (state: GrblSimulatorModalState, gCode: number): number =>
  state.isLaserOn && gCode !== GRBL_SIMULATOR_G_CODE.RAPID ? state.spindleSpeed : 0;

const getCommandErrorCode = (words: GcodeWords): number | undefined => {
  const gCodes: number[] = getWordNumbers(words, GRBL_SIMULATOR_WORD.G);
  const mCodes: number[] = getWordNumbers(words, GRBL_SIMULATOR_WORD.M);

  if (!gCodes.every(isGCodeKnown) || !mCodes.every(isMCodeKnown)) {
    return GRBL_SIMULATOR_ERROR_UNSUPPORTED_COMMAND;
  }

  const hasTwoMotionCommands: boolean = gCodes.filter(isMotionGCode).length > 1;

  return hasTwoMotionCommands ? GRBL_SIMULATOR_ERROR_MODAL_GROUP_VIOLATION : undefined;
};

const getLengthUnitFactor = (state: GrblSimulatorModalState): number =>
  state.isMetric ? 1 : GRBL_SIMULATOR_MM_PER_INCH;

const getStateAfterDistanceAndUnitCodes = (
  state: GrblSimulatorModalState,
  gCodes: readonly number[],
): GrblSimulatorModalState => {
  let nextState: GrblSimulatorModalState = state;

  for (const gCode of gCodes) {
    if (gCode === GRBL_SIMULATOR_G_CODE.ABSOLUTE || gCode === GRBL_SIMULATOR_G_CODE.RELATIVE) {
      nextState = { ...nextState, isAbsolute: gCode === GRBL_SIMULATOR_G_CODE.ABSOLUTE };
    }

    if (gCode === GRBL_SIMULATOR_G_CODE.MILLIMETRES || gCode === GRBL_SIMULATOR_G_CODE.INCHES) {
      nextState = { ...nextState, isMetric: gCode === GRBL_SIMULATOR_G_CODE.MILLIMETRES };
    }
  }

  return nextState;
};

const getStateAfterModalWords = (state: GrblSimulatorModalState, words: GcodeWords): GrblSimulatorModalState => {
  let nextState: GrblSimulatorModalState = getStateAfterDistanceAndUnitCodes(
    state,
    getWordNumbers(words, GRBL_SIMULATOR_WORD.G),
  );

  if (hasWord(words, GRBL_SIMULATOR_WORD.F)) {
    const feedRate: number = getWordValue(words, GRBL_SIMULATOR_WORD.F) * getLengthUnitFactor(nextState);

    nextState = { ...nextState, feedRate };
  }

  if (hasWord(words, GRBL_SIMULATOR_WORD.S)) {
    nextState = { ...nextState, spindleSpeed: getWordValue(words, GRBL_SIMULATOR_WORD.S) };
  }

  for (const mCode of getWordNumbers(words, GRBL_SIMULATOR_WORD.M).filter(isLaserSwitchMCode)) {
    nextState = { ...nextState, isLaserOn: mCode !== GRBL_SIMULATOR_M_CODE.LASER_OFF };
  }

  const modalMotionCode: number | undefined = getWordNumbers(words, GRBL_SIMULATOR_WORD.G).findLast(isModalMotionGCode);
  const motionMode: number = modalMotionCode ?? nextState.motionMode;

  return { ...nextState, motionMode };
};

const getAxisTarget = (state: GrblSimulatorModalState, words: GcodeWords, axis: keyof GrblAxisPosition): number => {
  const letter: string = AXIS_LETTERS[axis];

  if (!hasWord(words, letter)) {
    return state.position[axis];
  }

  const millimetres: number = getWordValue(words, letter) * getLengthUnitFactor(state);

  return state.isAbsolute ? millimetres + state.workCoordinateOffset[axis] : state.position[axis] + millimetres;
};

const getTargetPosition = (state: GrblSimulatorModalState, words: GcodeWords): GrblAxisPosition => ({
  x: getAxisTarget(state, words, 'x'),
  y: getAxisTarget(state, words, 'y'),
  z: getAxisTarget(state, words, 'z'),
});

const getAxisOffsetAfterSetOffset = (
  state: GrblSimulatorModalState,
  words: GcodeWords,
  axis: keyof GrblAxisPosition,
): number => {
  const letter: string = AXIS_LETTERS[axis];

  if (!hasWord(words, letter)) {
    return state.workCoordinateOffset[axis];
  }

  return state.position[axis] - getWordValue(words, letter) * getLengthUnitFactor(state);
};

const getOffsetAfterSetOffset = (state: GrblSimulatorModalState, words: GcodeWords): GrblAxisPosition => ({
  x: getAxisOffsetAfterSetOffset(state, words, 'x'),
  y: getAxisOffsetAfterSetOffset(state, words, 'y'),
  z: getAxisOffsetAfterSetOffset(state, words, 'z'),
});

const getRapidRate = (settings: SimulatorSettings): number => {
  const getRate = (settingNumber: number): number =>
    Number(settings[settingNumber] ?? GRBL_SIMULATOR_DEFAULT_SETTINGS[settingNumber]);

  return Math.min(getRate(GRBL_SIMULATOR_SETTING_MAX_RATE_X), getRate(GRBL_SIMULATOR_SETTING_MAX_RATE_Y));
};

const getDurationMs = (distance: number, rate: number): number => (distance / rate) * GRBL_SIMULATOR_MS_PER_MINUTE;

const getLinearDistance = (from: GrblAxisPosition, to: GrblAxisPosition): number =>
  Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);

const getArcCenterOffset = (state: GrblSimulatorModalState, words: GcodeWords): ArcCenterOffset => {
  const factor: number = getLengthUnitFactor(state);

  return {
    x: getWordValue(words, GRBL_SIMULATOR_WORD.I) * factor,
    y: getWordValue(words, GRBL_SIMULATOR_WORD.J) * factor,
  };
};

const getMovedResult = (
  state: GrblSimulatorModalState,
  target: GrblAxisPosition,
  durationMs: number,
  gCode: number,
): GrblSimulatorInterpretedLine => ({
  nextState: { ...state, position: target },
  motionBlock: { target, durationMs, spindleSpeed: getEffectiveLaserPower(state, gCode) },
});

const getArcResult = (
  gCode: number,
  state: GrblSimulatorModalState,
  words: GcodeWords,
  target: GrblAxisPosition,
): InterpretedLineOrError => {
  const centerOffset: ArcCenterOffset = getArcCenterOffset(state, words);

  if (!centerOffset.x && !centerOffset.y) {
    return { errorCode: GRBL_SIMULATOR_ERROR_NO_ARC_OFFSETS };
  }

  const isClockwise: boolean = gCode === GRBL_SIMULATOR_G_CODE.ARC_CLOCKWISE;
  const arcLength: number = getArcLength(state.position, target, centerOffset, isClockwise);

  return getMovedResult(state, target, getDurationMs(arcLength, state.feedRate), gCode);
};

const getMotionResult = (
  gCode: number,
  state: GrblSimulatorModalState,
  words: GcodeWords,
  settings: SimulatorSettings,
): InterpretedLineOrError => {
  const target: GrblAxisPosition = getTargetPosition(state, words);
  const distance: number = getLinearDistance(state.position, target);

  if (gCode === GRBL_SIMULATOR_G_CODE.RAPID) {
    return getMovedResult(state, target, getDurationMs(distance, getRapidRate(settings)), gCode);
  }

  if (!state.feedRate) {
    return { errorCode: GRBL_SIMULATOR_ERROR_UNDEFINED_FEED_RATE };
  }

  if (gCode === GRBL_SIMULATOR_G_CODE.LINEAR) {
    return getMovedResult(state, target, getDurationMs(distance, state.feedRate), gCode);
  }

  return getArcResult(gCode, state, words, target);
};

const getDwellResult = (state: GrblSimulatorModalState, words: GcodeWords): InterpretedLineOrError => {
  if (!hasWord(words, GRBL_SIMULATOR_WORD.P)) {
    return { errorCode: GRBL_SIMULATOR_ERROR_MISSING_VALUE_WORD };
  }

  const durationMs: number = getWordValue(words, GRBL_SIMULATOR_WORD.P) * GRBL_SIMULATOR_MS_PER_SECOND;

  const spindleSpeed: number = getEffectiveLaserPower(state, GRBL_SIMULATOR_G_CODE.DWELL);

  return { nextState: state, motionBlock: { target: state.position, durationMs, spindleSpeed } };
};

export const getInterpretedGcodeLine = (
  line: string,
  state: GrblSimulatorModalState,
  settings: SimulatorSettings,
): InterpretedLineOrError => {
  const words: GrblSimulatorGcodeWord[] | GrblSimulatorGcodeError = getParsedGcodeWords(line);

  if ('errorCode' in words) {
    return words;
  }

  const commandErrorCode: number | undefined = getCommandErrorCode(words);

  if (commandErrorCode) {
    return { errorCode: commandErrorCode };
  }

  const modalState: GrblSimulatorModalState = getStateAfterModalWords(state, words);
  const explicitGCode: number | undefined = getWordNumbers(words, GRBL_SIMULATOR_WORD.G).find(isMotionGCode);
  const motionGCode: number = explicitGCode ?? modalState.motionMode;

  switch (motionGCode) {
  case GRBL_SIMULATOR_G_CODE.SET_OFFSET:
    return {
      nextState: { ...modalState, workCoordinateOffset: getOffsetAfterSetOffset(modalState, words) },
      motionBlock: undefined,
    };
  case GRBL_SIMULATOR_G_CODE.DWELL:
    return getDwellResult(modalState, words);
  default:
    if (!hasMotionWords(words, motionGCode)) {
      return { nextState: modalState, motionBlock: undefined };
    }

    return getMotionResult(motionGCode, modalState, words, settings);
  }
};
