/**
 * The Redux store hook typed with the app store, so callers need no type cast.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useStore } from 'react-redux';
import type { AppStore } from './new.store';

export const useAppStore = useStore.withTypes<AppStore>();
