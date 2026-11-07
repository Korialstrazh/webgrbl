import { dismissHoverTooltips } from './dismiss.hover.tooltips';

describe(dismissHoverTooltips.name, () => {
  it('tells the innermost hovered element that the pointer left the page', () => {
    const outerElement: HTMLDivElement = document.createElement('div');
    const innerElement: HTMLButtonElement = document.createElement('button');
    const leaveListener = vi.fn();

    outerElement.append(innerElement);
    document.body.append(outerElement);
    outerElement.addEventListener('mouseout', leaveListener);
    vi.spyOn(document, 'querySelectorAll').mockReturnValue(outerElement.querySelectorAll('*'));

    dismissHoverTooltips();

    expect(leaveListener).toHaveBeenCalledTimes(1);
    expect(leaveListener.mock.calls.at(0)?.at(0)).toMatchObject({ target: innerElement, relatedTarget: null });
    vi.restoreAllMocks();
    outerElement.remove();
  });
});
