
"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/types/finance";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { PieChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const { user, budgets, transactions, loading, updateBudget } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    setCurrentMonth(format(new Date(), 'yyyy-MM'));
  }, []);

  const budgetStats = useMemo(() => {
    if (!currentMonth) return [];
    
    return CATEGORIES.expense.map(cat => {
      const budget = budgets.find(b => b.category === cat && b.month === currentMonth);
      const spent = transactions
        .filter(t => t.category === cat && t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const limit = budget?.amount || 0;
      const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      
      return { category: cat, spent, limit, percent };
    });
  }, [budgets, transactions, currentMonth]);

  const totalBudget = budgetStats.reduce((sum, s) => sum + s.limit, 0);
  const totalSpent = budgetStats.reduce((sum, s) => sum + s.spent, 0);

  if (loading || !user || !currentMonth) return <div className="p-10 text-center animate-pulse text-muted-foreground font-medium">Initializing Budget...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground ml-14 md:ml-0">Budget Planner</h1>
            <div className="bg-primary/20 text-primary dark:text-white px-4 py-2 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest border border-primary/20 w-fit">
              {format(new Date(), 'MMMM yyyy')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 rounded-[2rem] md:rounded-[2.5rem]">
              <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
                <div className="p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                  <PieChart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Total Budget</p>
                  <h3 className="text-2xl md:text-4xl font-black text-white">₹{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent text-white border-none shadow-xl shadow-accent/20 rounded-[2rem] md:rounded-[2.5rem]">
              <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
                <div className="p-3 md:p-4 bg-black/10 rounded-2xl backdrop-blur-md shrink-0">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">Available</p>
                  <h3 className="text-2xl md:text-4xl font-black text-white">₹{Math.max(0, totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[2rem] md:rounded-[3rem] overflow-hidden mac-card">
              <CardHeader className="p-6 md:p-8 pb-0">
                <CardTitle className="text-xl md:text-2xl font-black text-foreground">Monthly Targets</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
                {budgetStats.map((stat) => (
                  <div key={stat.category} className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                      <div className="space-y-1">
                        <h4 className="font-black text-foreground text-lg">{stat.category}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-foreground">₹{stat.spent.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground font-bold">/</span>
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                            {stat.limit > 0 ? `₹${stat.limit.toFixed(2)}` : 'No Limit'}
                          </span>
                        </div>
                      </div>
                      
                      {editingCategory === stat.category ? (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300 w-full sm:w-auto">
                          <Input 
                            type="number" 
                            className="flex-1 sm:w-28 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-foreground" 
                            value={tempAmount} 
                            onChange={(e) => setTempAmount(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" className="h-10 rounded-xl px-4" onClick={async () => {
                            await updateBudget(stat.category, Number(tempAmount), currentMonth);
                            setEditingCategory(null);
                          }}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-10 rounded-xl" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingCategory(stat.category);
                            setTempAmount(stat.limit.toString());
                          }}
                          className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all border border-primary/20 w-fit"
                        >
                          {stat.limit > 0 ? 'Adjust' : 'Set Budget'}
                        </button>
                      )}
                    </div>
                    <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-out rounded-full",
                          stat.percent > 90 ? "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        )}
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
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
