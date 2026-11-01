/**
 * The modifier keys of a key press that tell a shortcut from a plain key; both DOM and React keyboard events have them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export type KeyboardModifierState = Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey'>;
