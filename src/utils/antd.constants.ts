/**
 * Values from the antd component API that the app passes as props.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ButtonProps } from 'antd';

/** The compact button size, for actions inside a chip or a bar. */
export const ANTD_BUTTON_SIZE_SMALL: ButtonProps['size'] = 'small';

/** A button drawn as text only, for secondary actions. */
export const ANTD_BUTTON_TYPE_TEXT: ButtonProps['type'] = 'text';

/** A filled button in the accent colour, for the main action. */
export const ANTD_BUTTON_TYPE_PRIMARY: ButtonProps['type'] = 'primary';
