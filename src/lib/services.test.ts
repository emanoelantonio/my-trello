import { afterEach, describe, expect, it, vi } from 'vitest'
import { boardDataService, boardService, columnService, taskService } from './services'

describe('boardDataService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads board with columns and tasks', async () => {
    const board = {
      id: 'board-1',
      title: 'My Board',
      description: 'Test board',
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
      },
      {
        id: 'col-2',
        board_id: 'board-1',
        title: 'Done',
        sort_order: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        user_id: 'user-1',
      },
    ]

    const tasks = [
      {
        id: 'task-1',
        column_id: 'col-1',
        title: 'Write tests',
        description: null,
        assignee: null,
        due_date: null,
        priority: 'low',
        sort_order: 0,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]

    vi.spyOn(boardService, 'getBoard').mockResolvedValue(board)
    vi.spyOn(columnService, 'getColumns').mockResolvedValue(columns)
    vi.spyOn(taskService, 'getTasksByBoard').mockResolvedValue(tasks)

    const result = await boardDataService.getBoardWithColumns({} as any, 'board-1')

    expect(result.board).toEqual(board)
    expect(result.columnsWithTasks).toEqual([
      { ...columns[0], tasks: [tasks[0]] },
      { ...columns[1], tasks: [] },
    ])
  })

  it('creates a board with default columns', async () => {
    const board = {
      id: 'board-1',
      title: 'New Board',
      description: 'Board created for tests',
      color: 'bg-blue-500',
      user_id: 'user-1',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    vi.spyOn(boardService, 'createBoard').mockResolvedValue(board)

    const createColumnSpy = vi
      .spyOn(columnService, 'createColumn')
      .mockImplementation(async (_supabase, column) => ({
        ...column,
        id: `col-${column.sort_order}`,
        created_at: '2026-01-01T00:00:00.000Z',
      } as any))

    const createdBoard = await boardDataService.createBoardWithDefaultColumns({} as any, {
      title: board.title,
      userId: board.user_id,
      description: board.description ?? undefined,
      color: board.color,
    })

    expect(createdBoard).toEqual(board)
    expect(createColumnSpy).toHaveBeenCalledTimes(4)
    expect(createColumnSpy.mock.calls[0][1]).toMatchObject({
      title: 'To Do',
      board_id: board.id,
      user_id: board.user_id,
      sort_order: 0,
    })
  })
})
