"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { Account, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";

export function BalanceOverview({ 
  accounts, 
  transactions 
}: { 
  accounts: Account[], 
  transactions: Transaction[] 
}) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTransactions = transactions.filter(t => new Date(t.date) >= firstDayOfMonth);
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      label: "Net Worth",
      value: totalBalance,
      icon: Wallet,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100/50"
    },
    {
      label: "This Month Income",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100/50"
    },
    {
      label: "Monthly Outflow",
      value: monthlyExpense,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className={cn("border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2rem] group hover:shadow-xl transition-all duration-500", stat.bg)}>
          <CardContent className="p-8 flex items-center gap-6">
            <div className={cn("p-4 rounded-[1.25rem] transition-all duration-500 group-hover:scale-110 shadow-sm bg-white", stat.color)}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em]">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tight text-slate-900">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}