/**
 * What antd passes when a profile list entry is clicked; its key is the profile id.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MenuProps } from 'antd';

export type ProfileMenuClickInfo = Parameters<Required<MenuProps>['onClick']>[0];
