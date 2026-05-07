'use client'

import { AuthProvider } from "@/lib/supabase/auth";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push-notification";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
