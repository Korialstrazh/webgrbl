/**
 * Values of the machine profiles dialog: its overlay id, its width, the profiles file it imports and exports, and
 * the label of each origin corner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import { MACHINE_ORIGIN_CORNER } from '../../utils/profiles/machine.profile.constants';
import type { MachineOriginCorner } from '../../utils/profiles/machine.profile.constants';

export const MACHINE_PROFILES_DIALOG_OVERLAY_ID = 'machine-profiles-dialog';

/** Room for the profile list beside the form; a narrower window makes the dialog narrower. */
export const MACHINE_PROFILES_DIALOG_WIDTH = '56rem';

export const MACHINE_PROFILES_EXPORT_FILE_NAME = 'webgrbl-machine-profiles.json';

export const MACHINE_PROFILES_FILE_MIME_TYPE = 'application/json';

/** File types the import file picker offers. */
export const MACHINE_PROFILES_FILE_ACCEPT = '.json,application/json';

export const MACHINE_ORIGIN_CORNER_LABEL_KEY: Record<MachineOriginCorner, string> = {
  [MACHINE_ORIGIN_CORNER.FRONT_LEFT]: DEFAULT.MACHINE_PROFILES_ORIGIN_FRONT_LEFT,
  [MACHINE_ORIGIN_CORNER.BACK_LEFT]: DEFAULT.MACHINE_PROFILES_ORIGIN_BACK_LEFT,
  [MACHINE_ORIGIN_CORNER.FRONT_RIGHT]: DEFAULT.MACHINE_PROFILES_ORIGIN_FRONT_RIGHT,
  [MACHINE_ORIGIN_CORNER.BACK_RIGHT]: DEFAULT.MACHINE_PROFILES_ORIGIN_BACK_RIGHT,
};
