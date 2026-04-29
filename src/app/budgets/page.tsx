"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/types/finance";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { PieChart, TrendingUp } from "lucide-react";

export default function BudgetsPage() {
  const { user, budgets, transactions, loading, updateBudget } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>("");

  const currentMonth = format(new Date(), 'yyyy-MM');

  if (loading || !user) return <div className="p-10">Loading budgets...</div>;

  const getSpent = (cat: string) => {
    return transactions
      .filter(t => t.category === cat && t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const budgetStats = CATEGORIES.expense.map(cat => {
    const budget = budgets.find(b => b.category === cat && b.month === currentMonth);
    const spent = getSpent(cat);
    const limit = budget?.amount || 0;
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    
    return { category: cat, spent, limit, percent };
  });

  const totalBudget = budgetStats.reduce((sum, s) => sum + s.limit, 0);
  const totalSpent = budgetStats.reduce((sum, s) => sum + s.spent, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
            <div className="bg-secondary/50 px-4 py-2 rounded-full text-sm font-semibold">
              {format(new Date(), 'MMMM yyyy')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <PieChart className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-70">Total Monthly Budget</p>
                  <h3 className="text-3xl font-bold">${totalBudget.toLocaleString()}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground border-none">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="p-4 bg-black/10 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-70">Remaining Balance</p>
                  <h3 className="text-3xl font-bold">${Math.max(0, totalBudget - totalSpent).toLocaleString()}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {budgetStats.map((stat) => (
                  <div key={stat.category} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold">{stat.category}</h4>
                        <p className="text-xs text-muted-foreground">
                          ${stat.spent.toFixed(2)} of {stat.limit > 0 ? `$${stat.limit.toFixed(2)}` : 'No limit set'}
                        </p>
                      </div>
                      {editingCategory === stat.category ? (
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            className="w-24 h-8" 
                            value={tempAmount} 
                            onChange={(e) => setTempAmount(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" variant="default" className="h-8" onClick={async () => {
                            await updateBudget(stat.category, Number(tempAmount), currentMonth);
                            setEditingCategory(null);
                          }}>Set</Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingCategory(stat.category);
                            setTempAmount(stat.limit.toString());
                          }}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          {stat.limit > 0 ? 'Adjust' : 'Set Limit'}
                        </button>
                      )}
                    </div>
                    <Progress value={stat.percent} className={cn("h-2", stat.percent > 90 ? "bg-destructive/20" : "")} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { cn } from "@/lib/utils";