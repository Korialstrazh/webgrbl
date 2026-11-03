/**
 * What a test sample G-code export is made from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SampleCutSettings } from '../../materials/interfaces/SampleCutSettings';

export interface SampleGcodeExportRequestPayload {
  /** The entered settings of the cut. */
  cutSettings: SampleCutSettings;
  /** Name of the job, used for the file name and the G-code header. */
  jobName: string;
}
