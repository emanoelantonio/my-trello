import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { boardDataService, boardService } from '../lib/services'

const useSupabase = vi.fn()
const useUser = vi.fn()

vi.mock('@/lib/supabase/SupabaseProvider', () => ({
  useSupabase,
}))

vi.mock('@clerk/nextjs', () => ({
  useUser,
}))

const { useBoards } = await import('./useBoards')

function SetupComponent() {
  const { boards, loading, error, createBoard } = useBoards()

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error ?? ''}</div>
      <button onClick={() => createBoard({ title: 'New board' })}>Create</button>
      <div data-testid="boards">{boards.map((board) => board.title).join(',')}</div>
    </div>
  )
}

describe('useBoards', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads boards and creates a new board', async () => {
    useUser.mockReturnValue({ user: { id: 'user-1' }, isSignedIn: true })
    useSupabase.mockReturnValue({ supabase: {}, isLoaded: true })

    vi.spyOn(boardService, 'getBoards').mockResolvedValue([])
    vi.spyOn(boardDataService, 'createBoardWithDefaultColumns').mockResolvedValue({
      id: 'board-1',
      title: 'New board',
      description: null,
      color: 'bg-blue-500',
      user_id: 'user-1',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } as any)

    render(<SetupComponent />)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('boards')).toHaveTextContent('')

    await userEvent.click(screen.getByRole('button', { name: /Create/i }))

    await waitFor(() => expect(screen.getByTestId('boards')).toHaveTextContent('New board'))
  })
})
