/**
 * The custom property a bed-region drawer sets on its host while it is open: the width it takes from the left of the
 * bed region. On a wide window the bed moves aside by this width, so the drawer never covers the drawing or the rulers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** Must match the property read by the bed in the BedPanel stylesheet. */
export const BED_REGION_DRAWER_INSET_PROPERTY = '--bed-region-drawer-inset';
