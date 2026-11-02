/**
 * Payload of ToolpathReady: the finished toolpath and the document version it was made for.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Toolpath } from '../../toolpath/interfaces/Toolpath';

export interface ToolpathReadyPayload {
  /** The finished toolpath. */
  toolpath: Toolpath;
  /** The document version the generation read; a result for an older version is dropped. */
  documentVersion: number;
}
