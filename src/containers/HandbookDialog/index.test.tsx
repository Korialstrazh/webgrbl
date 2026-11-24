import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HandbookDialog } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const FIRST_COUNTER = 'Step 1 of 6';
const FOURTH_COUNTER = 'Step 4 of 6';
const LAST_COUNTER = 'Step 6 of 6';
const FRAME_STEP_BUTTON_NAME = /^4\. Frame and aim/;
const PREVIOUS_LABEL = 'Previous';
const NEXT_LABEL = 'Next';
const DONE_LABEL = 'Done';
const LAST_STEP_CLICKS = 5;

const renderDialog = (isOpen: boolean, onClose: () => void) => {
  const dialogElement = (isDialogOpen: boolean) => (
    <Provider store={newStore()}>
      <AntdTestProvider>
        <HandbookDialog isOpen={isDialogOpen} onClose={onClose} />
      </AntdTestProvider>
    </Provider>
  );
  const view = render(dialogElement(isOpen));

  return { rerenderOpen: (isDialogOpen: boolean) => view.rerender(dialogElement(isDialogOpen)) };
};

describe(HandbookDialog.name, () => {
  it('opens on the first step with Previous disabled', () => {
    renderDialog(true, vi.fn());

    expect(screen.getByText(FIRST_COUNTER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PREVIOUS_LABEL })).toBeDisabled();
  });

  it('jumps to a step from the step list', () => {
    renderDialog(true, vi.fn());

    fireEvent.click(screen.getByRole('button', { name: FRAME_STEP_BUTTON_NAME }));

    expect(screen.getByText(FOURTH_COUNTER)).toBeInTheDocument();
  });

  it('turns Next into Done on the last step and closes from it', () => {
    const onClose = vi.fn();
    renderDialog(true, onClose);

    for (let click = 0; click < LAST_STEP_CLICKS; click++) {
      fireEvent.click(screen.getByRole('button', { name: NEXT_LABEL }));
    }

    expect(screen.getByText(LAST_COUNTER)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: NEXT_LABEL })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: DONE_LABEL }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('starts at the first step again when reopened', async () => {
    const { rerenderOpen } = renderDialog(true, vi.fn());
    fireEvent.click(screen.getByRole('button', { name: FRAME_STEP_BUTTON_NAME }));

    rerenderOpen(false);
    await waitFor(() => expect(screen.queryByText(FOURTH_COUNTER)).toBeNull());
    rerenderOpen(true);

    await waitFor(() => expect(screen.getByText(FIRST_COUNTER)).toBeVisible());
  });

  it('asks to close on Escape', () => {
    const onClose = vi.fn();
    renderDialog(true, onClose);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY, code: ESCAPE_KEY, keyCode: 27 });

    expect(onClose).toHaveBeenCalled();
  });
});
