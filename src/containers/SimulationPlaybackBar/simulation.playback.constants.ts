/**
 * Fixed values of the simulation playback bar: the longest real time one frame may advance, the slider step, the
 * readout precision, the key that toggles play, and the test id of a layer bar segment.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/**
 * The most real time, in seconds, one animation frame advances the playback. A hidden tab gets no frames, so the
 * first frame after it comes back would otherwise jump by the whole time it was hidden.
 */
export const LONGEST_FRAME_REAL_S = 0.25;
/** The slider moves the time in steps of a tenth of a second. */
export const SIMULATION_SLIDER_STEP_S = 0.1;
/** The slider's end while there is no ready toolpath, so its range is never empty. */
export const EMPTY_SIMULATION_SLIDER_MAX_S = 1;
/** The head position is shown to a tenth of a millimetre. */
export const SIMULATION_READOUT_MM_DECIMALS = 1;
/** The key that toggles play while the bar has the focus. */
export const SIMULATION_PLAY_TOGGLE_KEY = ' ';
export const SIMULATION_LAYER_SEGMENT_TEST_ID = 'simulation-layer-segment';
