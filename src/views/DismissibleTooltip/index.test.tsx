import { ConfigProvider } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DismissibleTooltip } from '.';

const TOOLTIP_TEXT = 'Look from above';
const BUTTON_TEXT = 'Top';

describe(DismissibleTooltip.name, () => {
  it('shows on hover and goes away on a click', async () => {
    render(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <DismissibleTooltip title={TOOLTIP_TEXT} mouseEnterDelay={0}>
          <button>{BUTTON_TEXT}</button>
        </DismissibleTooltip>
      </ConfigProvider>,
    );

    fireEvent.mouseEnter(screen.getByText(BUTTON_TEXT).parentElement as HTMLElement);
    expect(await screen.findByText(TOOLTIP_TEXT)).toBeInTheDocument();

    fireEvent.click(screen.getByText(BUTTON_TEXT));
    await waitFor(() => {
      expect(document.querySelector('.ant-tooltip:not(.ant-tooltip-hidden)')).toBeNull();
    });
  });
});
