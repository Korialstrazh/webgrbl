import { act } from '@testing-library/react';
import { CHANGE_EVENT_NAME } from '../browser/browser.events.constants';
import { WIDE_LAYOUT_MEDIA_QUERY } from '../layout.constants';

const matchingQueries: Set<string> = new Set();
/** Each subscribed listener with the query it listens to, so a change reaches only the listeners of its query. */
const listeners: Map<EventListener, string> = new Map();

/** Installs a matchMedia that answers each query from setMatchMediaMatches(). Call it before rendering. */
export const installMatchMediaMock = (): void => {
  window.matchMedia = (query: string): MediaQueryList => ({
    media: query,
    get matches(): boolean {
      return matchingQueries.has(query);
    },
    onchange: null,
    addEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject): void => {
      listeners.set(typeof listener === 'function' ? listener : listener.handleEvent.bind(listener), query);
    },
    removeEventListener: (_eventName: string, listener: EventListenerOrEventListenerObject): void => {
      if (typeof listener === 'function') {
        listeners.delete(listener);
      }
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
};

/**
 * Sets the answer to one query, the wide-layout one unless another is named, and tells every subscribed component, like
 * a real window resize would.
 */
export const setMatchMediaMatches = (isMatching: boolean, mediaQuery: string = WIDE_LAYOUT_MEDIA_QUERY): void => {
  if (isMatching) {
    matchingQueries.add(mediaQuery);
  } else {
    matchingQueries.delete(mediaQuery);
  }

  act(() => {
    for (const [listener, listenedQuery] of listeners) {
      if (listenedQuery === mediaQuery) {
        listener(Object.assign(new Event(CHANGE_EVENT_NAME), { matches: isMatching }));
      }
    }
  });
};

/** Forgets the answer and every subscriber, so one test cannot leak its layout into the next. */
export const resetMatchMediaMock = (): void => {
  matchingQueries.clear();
  listeners.clear();
};
