import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AboutDialog } from '.';
import { APP_VERSION } from '../../utils/app.version.constants';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const REPOSITORY_URL = 'https://github.com/Korialstrazh/webgrbl';
const SOURCE_LINK_NAME = 'Source code on GitHub';
const DESCRIPTION_PATTERN = /drives GRBL laser cutters and engravers/;

const renderDialog = (onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={newStore()}>
      <AntdTestProvider>
        <AboutDialog isOpen onClose={onClose} />
      </AntdTestProvider>
    </Provider>,
  );
};

describe(AboutDialog.name, () => {
  it('shows the version, description, creator and licence', () => {
    renderDialog();

    expect(screen.getByText(`Version ${APP_VERSION}`)).toBeInTheDocument();
    expect(screen.getByText(DESCRIPTION_PATTERN)).toBeInTheDocument();
    expect(screen.getByText('Created by michael.morosov')).toBeInTheDocument();
    expect(screen.getByText('Released under the Apache License 2.0.')).toBeInTheDocument();
    expect(screen.getByText('Inspired by LaserGRBL, the Windows laser engraving app.')).toBeInTheDocument();
  });

  it('links to the source code in a new tab', () => {
    renderDialog();

    const sourceLink: HTMLElement = screen.getByRole('link', { name: SOURCE_LINK_NAME });

    expect(sourceLink).toHaveAttribute('href', REPOSITORY_URL);
    expect(sourceLink).toHaveAttribute('target', '_blank');
    expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('asks to close on Escape', () => {
    const onClose = vi.fn();
    renderDialog(onClose);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY, code: ESCAPE_KEY, keyCode: 27 });

    expect(onClose).toHaveBeenCalled();
  });
});
