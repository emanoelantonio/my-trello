import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { boardDataService, boardService, columnService, taskService } from '../lib/services'

const useSupabase = vi.fn()
const useUser = vi.fn()

vi.mock('@/lib/supabase/SupabaseProvider', () => ({
  useSupabase,
}))

vi.mock('@clerk/nextjs', () => ({
  useUser,
}))

const { useBoard } = await import('./useBoard')

function SetupComponent({ boardId }: { boardId: string }) {
  const { board, columns, loading, error, createDataTask, createColumn, updateBoard } = useBoard(boardId)

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="board-title">{board?.title ?? ''}</div>
      <div data-testid="columns">{columns.map((column) => `${column.title}:${column.tasks.length}`).join('|')}</div>
      <div data-testid="error">{error ?? ''}</div>
      <button onClick={() => createDataTask('col-1', { title: 'New task' })}>Create task</button>
      <button onClick={() => createColumn('Next col')}>Create column</button>
      <button onClick={() => updateBoard({ title: 'Updated board' })}>Update board</button>
    </div>
  )
}

describe('useBoard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads board and creates a task successfully', async () => {
    useUser.mockReturnValue({ user: { id: 'user-1' }, isSignedIn: true })
    useSupabase.mockReturnValue({ supabase: {}, isLoaded: true })

    const board = {
      id: 'board-1',
      title: 'Test Board',
      description: 'Board for testing',
      color: 'bg-blue-500',
      user_id: 'user-1',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    const columns = [
      {
        id: 'col-1',
        board_id: 'board-1',
        title: 'To Do',
        sort_order: 0,
        created_at: '2026-01-01T00:00:00.000Z',
        user_id: 'user-1',
        tasks: [],
      },
    ]

    vi.spyOn(boardDataService, 'getBoardWithColumns').mockResolvedValue({ board, columnsWithTasks: columns })
    vi.spyOn(taskService, 'createTask').mockResolvedValue({
      id: 'task-1',
      column_id: 'col-1',
      title: 'New task',
      description: null,
      assignee: null,
      due_date: null,
      priority: 'low',
      sort_order: 0,
      created_at: '2026-01-01T00:00:00.000Z',
    } as any)

    render(<SetupComponent boardId="board-1" />)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('board-title')).toHaveTextContent('Test Board')
    expect(screen.getByTestId('columns')).toHaveTextContent('To Do:0')

    await userEvent.click(screen.getByRole('button', { name: /Create task/i }))

    await waitFor(() => expect(screen.getByTestId('columns')).toHaveTextContent('To Do:1'))
  })

  it('creates a new column and updates the board', async () => {
    useUser.mockReturnValue({ user: { id: 'user-1' }, isSignedIn: true })
    useSupabase.mockReturnValue({ supabase: {}, isLoaded: true })

    const board = {
      id: 'board-1',
      title: 'Test Board',
      description: 'Board for testing',
      color: 'bg-blue-500',
      user_id: 'user-1',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    const columns = [
      {
        id: 'col-1',
        board_id: 'board-1',
        title: 'To Do',
        sort_order: 0,
        created_at: '2026-01-01T00:00:00.000Z',
        user_id: 'user-1',
        tasks: [],
      },
    ]

    vi.spyOn(boardDataService, 'getBoardWithColumns').mockResolvedValue({ board, columnsWithTasks: columns })
    vi.spyOn(columnService, 'createColumn').mockResolvedValue({
      id: 'col-2',
      board_id: 'board-1',
      title: 'Next col',
      sort_order: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      user_id: 'user-1',
    } as any)
    vi.spyOn(boardService, 'updateBoard').mockResolvedValue({
      ...board,
      title: 'Updated board',
    })

    render(<SetupComponent boardId="board-1" />)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    await userEvent.click(screen.getByRole('button', { name: /Create column/i }))
    await waitFor(() => expect(screen.getByTestId('columns')).toHaveTextContent('Next col:0'))

    await userEvent.click(screen.getByRole('button', { name: /Update board/i }))
    await waitFor(() => expect(screen.getByTestId('board-title')).toHaveTextContent('Updated board'))
  })
})
