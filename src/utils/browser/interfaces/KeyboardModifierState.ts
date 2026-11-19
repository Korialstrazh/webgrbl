/**
 * The modifier keys of a key press that tell a shortcut from a plain key; both DOM and React keyboard events have them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export type KeyboardModifierState = Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey'>;
