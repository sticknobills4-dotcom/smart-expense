"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Account, Transaction } from "@/types/finance";

export function BalanceOverview({ 
  accounts, 
  transactions 
}: { 
  accounts: Account[], 
  transactions: Transaction[] 
}) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Calculate this month's income and expenses
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
      label: "Total Balance",
      value: totalBalance,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Monthly Income",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      label: "Monthly Expenses",
      value: monthlyExpense,
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";