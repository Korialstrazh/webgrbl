import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlugBadge } from '.';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const REASON_TEXT = 'Connect to move';

describe(PlugBadge.name, () => {
  it('names the reason and shows it in a tooltip on keyboard focus', async () => {
    render(<AntdTestProvider><PlugBadge reasonText={REASON_TEXT} /></AntdTestProvider>);

    const badge: HTMLElement = screen.getByRole('img', { name: REASON_TEXT });

    expect(badge).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.focus(badge);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(REASON_TEXT);
    });
  });

  it('is a named button that calls its handler when it has one', () => {
    const onClick = vi.fn();

    render(<AntdTestProvider><PlugBadge reasonText={REASON_TEXT} onClick={onClick} /></AntdTestProvider>);
    fireEvent.click(screen.getByRole('button', { name: REASON_TEXT }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('closes its tooltip when it is clicked and when anything scrolls', async () => {
    render(<AntdTestProvider><PlugBadge reasonText={REASON_TEXT} onClick={vi.fn()} /></AntdTestProvider>);
    const button: HTMLElement = screen.getByRole('button', { name: REASON_TEXT });

    fireEvent.focus(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent(REASON_TEXT));

    fireEvent.click(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());

    fireEvent.blur(button);
    fireEvent.focus(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    fireEvent.scroll(window);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
