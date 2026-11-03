/**
 * What the 3D view needs from a WebGL renderer. Declared here so that only the runtime module imports three.js.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnSceneRenderer {
  /** Releases the WebGL context and everything the renderer holds. */
  dispose: () => void;
}
