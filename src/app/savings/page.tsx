
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
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-5 h-5" />
              New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savingsGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <Card key={goal.id} className="border-none shadow-sm relative group">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEdit(goal)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => {
                        if(confirm("Delete goal?")) deleteSavingsGoal(goal.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Saved</p>
                        <p className="text-2xl font-black text-primary">${goal.currentAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Target</p>
                        <p className="text-lg font-bold">${goal.targetAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-secondary" />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        className="flex-1 font-bold"
                        onClick={() => {
                          const amount = Number(prompt("Add amount to savings:"));
                          if (amount) updateSavingsGoal(goal.id, { currentAmount: goal.currentAmount + amount });
                        }}
                      >
                        Add Savings
                      </Button>
                      <Button variant="outline" className="flex-1 font-bold" onClick={() => handleEdit(goal)}>View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {savingsGoals.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold">Dreaming of something big?</h3>
                <p className="text-muted-foreground">Set a goal and we'll help you track your progress.</p>
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
