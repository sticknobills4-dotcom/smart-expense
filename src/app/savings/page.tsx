"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { SavingsGoalDialog } from "@/components/savings/SavingsGoalDialog";
import { SavingsGoal } from "@/types/finance";

export default function SavingsGoalsPage() {
  const { user, savingsGoals, loading, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>();

  if (loading || !user) return <div className="p-10 text-center">Loading goals...</div>;

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedGoal) {
      updateSavingsGoal(selectedGoal.id, data);
    } else {
      addSavingsGoal(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-5xl auto p-4 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground ml-14 md:ml-0">Savings Goals</h1>
            <Button onClick={handleAddNew} className="gap-2 w-full sm:w-auto">
              <Plus className="w-5 h-5" />
              New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savingsGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <Card key={goal.id} className="border-none shadow-sm relative group overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8">
                    <div className="min-w-0">
                      <CardTitle className="text-lg md:text-xl font-bold truncate">{goal.name}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden group-hover:flex items-center gap-1 transition-all">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(goal)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                          if(confirm("Delete goal?")) deleteSavingsGoal(goal.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 md:px-8 pb-6 md:pb-8 space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">Saved</p>
                        <p className="text-xl md:text-2xl font-black text-primary">₹{goal.currentAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">Target</p>
                        <p className="text-base md:text-lg font-bold">₹{goal.targetAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2.5 bg-secondary" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1 font-bold h-10"
                        onClick={() => {
                          const amount = Number(prompt("Add amount to savings (₹):"));
                          if (amount) updateSavingsGoal(goal.id, { currentAmount: goal.currentAmount + amount });
                        }}
                      >
                        Add Savings
                      </Button>
                      <Button variant="outline" className="flex-1 font-bold h-10" onClick={() => handleEdit(goal)}>View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {savingsGoals.length === 0 && (
              <div className="col-span-full py-16 md:py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold">Dreaming of something big?</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Set a goal and we'll help you track your progress.</p>
                <Button onClick={handleAddNew} variant="outline" className="mt-6">Create Your First Goal</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <SavingsGoalDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSubmit={handleSubmit}
        initialData={selectedGoal}
      />
    </div>
  );
}