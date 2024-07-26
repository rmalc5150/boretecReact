// src/types/PageProps.ts
import { Session } from "@supabase/supabase-js";

// Define a type for the props
export interface PageProps {
  session: Session | null;
  loading: boolean;
  handleLogout: () => void;
}