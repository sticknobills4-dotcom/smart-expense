"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

/**
 * Root Page: Handles automatic redirection to either dashboard or login
 * based on the user's authentication status. This replaces the default starter page.
 */
export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest animate-pulse">Loading SmartExpense...</p>
      </div>
    </div>
  );
}
