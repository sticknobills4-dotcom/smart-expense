
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
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
    
    // Efficient single-pass filter/reduce
    return transactions.reduce((acc, t) => {
      if (new Date(t.date) >= firstDayOfMonth) {
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
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100/50"
    },
    {
      label: "Monthly Income",
      value: monthlyStats.income,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100/50"
    },
    {
      label: "Monthly Outflow",
      value: monthlyStats.expense,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100/50"
    }
  ], [totalBalance, monthlyStats]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn("border-none shadow-[0_15px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem] group hover:shadow-2xl transition-all duration-500 overflow-hidden", stat.bg)}>
          <CardContent className="p-8 flex items-center gap-6 relative">
            <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm bg-white", stat.color)}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <stat.icon className="w-24 h-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
