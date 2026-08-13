import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import Navbar from './navbar'

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  UserButton: () => <div data-testid="user-button" />,
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in">{children}</div>
  ),
  SignUpButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-up">{children}</div>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

const mockedUseUser = vi.mocked(useUser)
const mockedUsePathname = vi.mocked(usePathname)

describe('Navbar', () => {
  it('renders signed-out home header', () => {
    mockedUseUser.mockReturnValue({ isLoaded: true, user: null, isSignedIn: false })
    mockedUsePathname.mockReturnValue('/')

    render(<Navbar />)

    expect(screen.getByText(/My Trello/i)).toBeVisible()
    expect(screen.getByTestId('sign-in')).toBeVisible()
    expect(screen.getByTestId('sign-up')).toBeVisible()
  })

  it('renders dashboard header with user button', () => {
    mockedUseUser.mockReturnValue({ isLoaded: true, user: { firstName: 'Emanoel' }, isSignedIn: true })
    mockedUsePathname.mockReturnValue('/dashboard')

    render(<Navbar />)

    expect(screen.getByText(/My Trello/i)).toBeVisible()
    expect(screen.getByTestId('user-button')).toBeVisible()
  })

  it('renders board header and filter button', () => {
    mockedUseUser.mockReturnValue({ isLoaded: true, user: { firstName: 'Emanoel' }, isSignedIn: true })
    mockedUsePathname.mockReturnValue('/boards/board-1')

    render(
      <Navbar boardTitle="Board name" onEditBoard={() => { }} onFilterClick={() => { }} filterCount={2} />
    )

    expect(screen.getByText(/Back to Dashboard/i)).toBeVisible()
    expect(screen.getByText(/Board name/i)).toBeVisible()
    expect(screen.getByText(/Filter/i)).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
  })
})
