
"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { SmartInsights } from "@/components/ai/SmartInsights";
import { Sparkles } from "lucide-react";

export default function InsightsPage() {
  const { user, transactions, accounts, budgets, loading } = useFinance();

  if (loading || !user) return <div className="p-10">Loading insights...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex items-center gap-3 ml-14 md:ml-0">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Financial Insights</h1>
          </div>

          <SmartInsights 
            transactions={transactions} 
            accounts={accounts} 
            budgets={budgets} 
          />
        </div>
      </main>
    </div>
  );
}
