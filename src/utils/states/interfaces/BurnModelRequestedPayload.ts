/**
 * Payload of the start of a burn model build.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnModelRequestedPayload {
  /** The material the model is built for. */
  materialId: string;
}
