/**
 * What antd passes when a profile list entry is clicked; its key is the profile id.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MenuProps } from 'antd';

export type ProfileMenuClickInfo = Parameters<Required<MenuProps>['onClick']>[0];
