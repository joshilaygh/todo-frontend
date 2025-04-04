import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders multiple login elements', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const logins = screen.getAllByText(/login/i);
  expect(logins).toHaveLength(2);
});

