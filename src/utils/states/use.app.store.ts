/**
 * The Redux store hook typed with the app store, so callers need no type cast.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useStore } from 'react-redux';
import type { AppStore } from './new.store';

export const useAppStore = useStore.withTypes<AppStore>();
