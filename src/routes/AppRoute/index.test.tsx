import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { newStore } from '../../utils/states/new.store';

const APP_TITLE = 'webgrbl';

describe(AppRoute.name, () => {
  it('shows the app title as the page heading', () => {
    render(
      <Provider store={newStore()}>
        <AppRoute />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: APP_TITLE })).toBeInTheDocument();
  });
});
