/**
 * The key handler of the objects layer on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { KeyboardEvent } from 'react';

export type BedObjectsKeyDownHandler = (keyboardEvent: KeyboardEvent<SVGGElement>) => void;
