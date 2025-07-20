import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { MovieProvider } from '../../context/MovieContext';

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <MovieProvider>
        {ui}
      </MovieProvider>
    </BrowserRouter>
  );
};

test('renders header with logo', () => {
  renderWithProviders(<Header />);
  expect(screen.getByText('MovieFinder')).toBeInTheDocument();
});

test('renders search input', () => {
  renderWithProviders(<Header />);
  expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
});
