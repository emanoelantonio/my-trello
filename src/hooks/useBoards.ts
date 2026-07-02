'use client'
import { boardDataService, boardService } from "@/lib/services";
import { Board } from "@/lib/supabase/models";
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