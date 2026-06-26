import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

function renderApp() {
  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

test('отображает название приложения FindTeam', () => {
  renderApp();
  expect(screen.getByText('FindTeam')).toBeInTheDocument();
});

test('отображает навигацию по разделам', () => {
  renderApp();
  expect(screen.getByText('Главная')).toBeInTheDocument();
  expect(screen.getByText('Команды')).toBeInTheDocument();
  expect(screen.getByText('Игроки')).toBeInTheDocument();
});
