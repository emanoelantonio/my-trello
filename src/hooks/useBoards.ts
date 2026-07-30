'use client'
import { boardDataService, boardService } from "@/lib/services";
import { Board } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type CreateBoardInput = {
  title: string;
  description?: string;
  color?: string;
}

export function useBoards() {

  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!user || !supabase) return;
    try {
      setLoading(true);
      setError(null);

      const data = await boardService.getBoards(supabase, user.id);
      setBoards(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load boards.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);


  useEffect(() => {
    if (!isLoaded || !user || !supabase) return;

    loadBoards();
  }, [isLoaded, user, supabase, loadBoards]);

  const createBoard = useCallback(
    async (boardData: CreateBoardInput) => {
      if (!user) {
        throw new Error('User not authenticated.');
      }
      if (!isLoaded || !supabase) {
        throw new Error('Supabase client not loaded');
      }
      try {
        setError(null);
        const newBoard = await boardDataService.createBoardWithDefaultColumns(supabase, {
          ...boardData,
          userId: user.id,
        })
        setBoards((prev) => [...prev, newBoard]);

        return newBoard;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error creating board';
        setError(message);

        throw error;
      }
    }, [isLoaded, supabase, user])


  return { createBoard, boards, loading, error, reload: loadBoards, }
}