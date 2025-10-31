import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

it('renders landing content', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  expect(screen.getByText(/Wanderly/i)).toBeInTheDocument()
})
