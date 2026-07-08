"use client";

import { useSession } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo } from "react";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, session } = useSession();

  const supabase = useMemo(() => {
    if (!isLoaded) return null;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    return createClient(
      supabaseUrl,
      supabaseKey,
      {
        accessToken: async () => session?.getToken() ?? null,
      }
    );
  }, [isLoaded, session]);

  const value = useMemo(
    () => ({
      supabase,
      isLoaded,
    }),
    [isLoaded, supabase]
  );

  return (
    <Context.Provider value={value}>
      {/* {!isLoaded ? <div> Loading...</div> : children} */}
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase needs to be inside the provider");
  }

  return context;
};
