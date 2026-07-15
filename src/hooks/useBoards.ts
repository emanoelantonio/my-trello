'use client'
import { boardDataService, boardService, taskService } from "@/lib/services";
import { Board, ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, supabase]);

  async function loadBoards() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function createBord(boardData: {
    title: string,
    description?: string,
    color?: string,
  }) {
    if (!user) throw new Error("User not authenticated");
    if (!isLoaded || !supabase) throw new Error("Supabase client not loaded");

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(supabase!,
        {
          ...boardData,
          userId: user.id,
        });
      setBoards((prevBoards) => [newBoard, ...prevBoards]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creating board");
    }
  }

  return { createBord, boards, loading, error }
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

  async function loadBoard() {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(supabase!, boardId);
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates);
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update board.");
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
    }) {
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order: columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || 'low'
      })

      setColumns((prev) => prev.map(
        (col) => col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col))

      return newTask;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create real Task.");
    }
  }

  async function moveTask(taskId: string, newColumnId: string, newOrder: number) {
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumns((prev) => {
        const newColumns = [...prev];

        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }
        if (taskToMove) {
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }
        return newColumns;
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to move Task.");
    }
  }

  return { board, columns, setColumns, loading, error, updateBoard, createRealTask, moveTask }
}