import { fireEvent, render, screen } from '@testing-library/react';
import { ToolpathToolbar } from '.';
import { TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';

const TRAVEL_NAME = 'Show travel moves';

const renderToolbar = (isTravelShown: boolean, onTravelShownChange: (isShown: boolean) => void): void => {
  render(
    <ToolpathToolbar
      displayMode={TOOLPATH_DISPLAY_MODE.POWER_SHADING}
      onDisplayModeChange={vi.fn()}
      isTravelShown={isTravelShown}
      onTravelShownChange={onTravelShownChange}
    />,
  );
};

describe(ToolpathToolbar.name, () => {
  it('shows travel as a pressed toggle button while travel moves are drawn', () => {
    renderToolbar(true, vi.fn());

    expect(screen.getByRole('button', { name: TRAVEL_NAME })).toHaveAttribute('aria-pressed', 'true');
  });

  it('turns travel moves on with a press of the unpressed toggle', () => {
    const onTravelShownChange = vi.fn();

    renderToolbar(false, onTravelShownChange);
    const travelToggle: HTMLElement = screen.getByRole('button', { name: TRAVEL_NAME });

    expect(travelToggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(travelToggle);

    expect(onTravelShownChange).toHaveBeenCalledWith(true);
  });
});
