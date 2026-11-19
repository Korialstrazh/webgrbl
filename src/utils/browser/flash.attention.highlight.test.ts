import { ATTENTION_HIGHLIGHT_ATTRIBUTE, ATTENTION_HIGHLIGHT_DURATION_MS } from './attention.highlight.constants';
import { flashAttentionHighlight } from './flash.attention.highlight';

describe(flashAttentionHighlight.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('glows each given element and removes the glow once it has run', () => {
    const firstElement: HTMLElement = document.createElement('div');
    const secondElement: HTMLElement = document.createElement('div');

    flashAttentionHighlight([firstElement, undefined, secondElement, null]);

    expect(firstElement).toHaveAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE);
    expect(secondElement).toHaveAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE);

    vi.advanceTimersByTime(ATTENTION_HIGHLIGHT_DURATION_MS);

    expect(firstElement).not.toHaveAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE);
    expect(secondElement).not.toHaveAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE);
  });
});
