/**
 * Payload of the start of a burn model build.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnModelRequestedPayload {
  /** The material the model is built for. */
  materialId: string;
}
