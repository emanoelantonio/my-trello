import { boardDataService, boardService, columnService, taskService } from "@/lib/services";
import { Board, ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type CreateTaskInput = {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
};

type UpdateBoardInput = {
  title?: string;
  description?: string;
  color?: string;
}

function moveTaskInColumns(
  columns: ColumnWithTasks[],
  taskId: string,
  targetColumnId: string,
  targetIndex: number
): ColumnWithTasks[] {
  const nextColumns = columns.map((column) => ({
    ...column, tasks: [...column.tasks],
  }));

  let taskToMove: Task | null = null;

  for (const column of nextColumns) {

    const taskIndex = column.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) continue;

    taskToMove = column.tasks[taskIndex];

    column.tasks.splice(taskIndex, 1);

    break;
  }

  if (!taskToMove) {
    return columns;
  }

  const targetColumn = nextColumns.find((column) => column.id === targetColumnId);

  if (!targetColumn) {

    return columns;
  }

  targetColumn.tasks.splice(targetIndex, 0, taskToMove);

  return nextColumns;
}

export function useBoard(boardId: string) {

  const { supabase, isLoaded } = useSupabase();
  const { user } = useUser();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadBoard = useCallback(async () => {
    if (!supabase || !boardId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await boardDataService.getBoardWithColumns(supabase, boardId);
      setBoard(data.board);

      setColumns(data.columnsWithTasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    if (!isLoaded || !boardId || !supabase) return;

    loadBoard();
  }, [isLoaded, loadBoard, boardId, supabase]);


  const updateBoard = useCallback(async (updates: UpdateBoardInput) => {
    if (!supabase) {
      throw new Error('Supabase client not loaded');
    }
    try {
      setError(null);

      const updatedBoard = await boardService.updateBoard(supabase, boardId, updates);
      setBoard(updatedBoard);

      return updatedBoard;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update board.");
    }
  }, [boardId, supabase]);


  const createDataTask = useCallback(async (columnId: string, taskData: CreateTaskInput) => {
    try {
      setError(null);

      const column = columns.find((column) => column.id === columnId);

      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description ?? null,
        assignee: taskData.assignee ?? null,
        due_date: taskData.dueDate ?? null,
        column_id: columnId,
        sort_order: column?.tasks.length ?? 0,
        priority: taskData.priority ?? 'low'
      })

      setColumns((prevColumns) => prevColumns.map(
        (column) => column.id === columnId
          ? {
            ...column,
            tasks: [...column.tasks, newTask]
          }
          : column));

      return newTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create real Task.";

      setError(message);
      throw error;
    }
  }, [columns, supabase]);


  const moveTask = useCallback(async (taskId: string, newColumnId: string, newOrder: number) => {
    if (!supabase) {
      throw new Error('Supabase client not loaded');
    }
    try {
      setError(null);
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumns((prevColumns) => {
        const nextColumns = prevColumns.map((column) => ({
          ...column,
          tasks: [...column.tasks],
        }));

        let taskToMove: Task | null = null;

        for (const column of nextColumns) {
          const taskIndex = column.tasks.findIndex((task) => task.id === taskId);

          if (taskIndex !== -1) {
            taskToMove = column.tasks[taskIndex];
            column.tasks.splice(taskIndex, 1);
            break;
          }
        }
        if (!taskToMove) return prevColumns;

        const targetColumn = nextColumns.find((column) => column.id === newColumnId);

        if (!targetColumn) return prevColumns;

        targetColumn.tasks.splice(newOrder, 0, taskToMove);

        return nextColumns;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to move Task.";

      setError(message);
      throw error;
    }
  }, [supabase]);


  const createColumn = useCallback(async (title: string) => {
    if (!board || !user) throw new Error('Board or user not loaded.');

    if (!supabase) {
      throw new Error('Supabase client not loaded');
    }

    try {
      setError(null);

      const newColumn = await columnService.createColumn(supabase, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });
      setColumns((prevColumn) => [...prevColumn, { ...newColumn, tasks: [] }]);

      return newColumn;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create column.";

      setError(message);
    }
  }, [board, columns.length, supabase, user]);

  const updateColumn = useCallback(async (columnId: string, title: string) => {

    if (!supabase) {
      throw new Error('Supabase client not loaded');
    }

    try {
      setError(null);

      const updatedColumn = await columnService.updateColumnTitle(supabase, columnId, title);

      setColumns((prevColumns) => prevColumns.map((column) =>
        column.id === columnId
          ? { ...column, ...updatedColumn }
          : column));

      return updatedColumn;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create Column.";

      setError(message);
      throw error;
    }
  }, [supabase]);

  const previewTaskMove = useCallback((
    taskId: string, targetColumnId: string, targetIndex: number) => {
    setColumns((prevColumns) => {
      moveTaskInColumns(
        prevColumns, taskId, targetColumnId, targetIndex
      )
      return prevColumns;
    })
  }, [])

  return {
<<<<<<< HEAD
    board, columns, loading, error, updateBoard, createDataTask, moveTask,
    createColumn, updateColumn, setColumns, reload: loadBoard,
=======
    board, columns, loading, error, updateBoard, createTask, moveTask, previewTaskMove,
    createColumn, updateColumn, reload: loadBoard,
>>>>>>> origin/develop
  }
}