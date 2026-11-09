import { MOUSE_OUT_EVENT_NAME } from './browser.events.constants';
import { dismissHoverTooltips } from './dismiss.hover.tooltips';

describe(dismissHoverTooltips.name, () => {
  it('tells the innermost hovered element that the pointer left the page', () => {
    const outerElement: HTMLDivElement = document.createElement('div');
    const innerElement: HTMLButtonElement = document.createElement('button');
    const leaveListener = vi.fn();

    outerElement.append(innerElement);
    document.body.append(outerElement);
    outerElement.addEventListener(MOUSE_OUT_EVENT_NAME, leaveListener);
    vi.spyOn(document, 'querySelectorAll').mockReturnValue(outerElement.querySelectorAll('*'));

    dismissHoverTooltips();

    expect(leaveListener).toHaveBeenCalledTimes(1);
    expect(leaveListener.mock.calls.at(0)?.at(0)).toMatchObject({ target: innerElement, relatedTarget: null });
    vi.restoreAllMocks();
    outerElement.remove();
  });

  it('without a hovered element tells the element last entered, as on a touch screen', () => {
    const tappedElement: HTMLSpanElement = document.createElement('span');
    const leaveListener = vi.fn();

    document.body.append(tappedElement);
    tappedElement.addEventListener(MOUSE_OUT_EVENT_NAME, leaveListener);

    dismissHoverTooltips(tappedElement);

    expect(leaveListener).toHaveBeenCalledTimes(1);
    tappedElement.remove();
  });

  it('ignores an element last entered that has left the page', () => {
    const removedElement: HTMLSpanElement = document.createElement('span');
    const leaveListener = vi.fn();

    removedElement.addEventListener(MOUSE_OUT_EVENT_NAME, leaveListener);

    dismissHoverTooltips(removedElement);

    expect(leaveListener).not.toHaveBeenCalled();
  });
});
