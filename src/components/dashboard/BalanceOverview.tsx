
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Account, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

export function BalanceOverview({ 
  accounts, 
  transactions 
}: { 
  accounts: Account[], 
  transactions: Transaction[] 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  
  const monthlyStats = useMemo(() => {
    if (!mounted) return { income: 0, expense: 0 };
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions.reduce((acc, t) => {
      const tDate = new Date(t.date);
      if (tDate >= firstDayOfMonth) {
        if (t.type === 'income') acc.income += t.amount;
        if (t.type === 'expense') acc.expense += t.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions, mounted]);

  const stats = useMemo(() => [
    {
      label: "Net Worth",
      value: totalBalance,
      icon: Wallet,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      label: "Monthly Income",
      value: monthlyStats.income,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      label: "Monthly Outflow",
      value: monthlyStats.expense,
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20",
    }
  ], [totalBalance, monthlyStats]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 md:h-32 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[2rem] md:rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn(
          "border-none shadow-[0_15px_40px_rgba(0,0,0,0.03)] rounded-[2rem] md:rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500 overflow-hidden", 
          stat.bg,
          stat.label === "Net Worth" ? "sm:col-span-2 md:col-span-1" : ""
        )}>
          <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6 relative">
            <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm bg-white dark:bg-slate-900 shrink-0", stat.color)}>
              <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-0.5 md:space-y-1 relative z-10 min-w-0">
              <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground truncate">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none hidden md:block">
              <stat.icon className="w-20 h-20 md:w-24 md:h-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
