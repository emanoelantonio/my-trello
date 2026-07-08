'use client'
import { boardDataService, boardService } from "@/lib/services";
import { Board, Column } from "@/lib/supabase/models";
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
  const [columns, setColumns] = useState<Column[]>([]);
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
      setColumns(data.columns);
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

  return { board, columns, loading, error, updateBoard }
}