"use client"

import { useState } from "react";
import { analyzeSpendingHabits, SpendingInsightsOutput } from "@/ai/flows/spending-insights";
import { budgetRecommendations, BudgetRecommendationsOutput } from "@/ai/flows/budget-recommendations";
import { Transaction, Account, Budget } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function SmartInsights({ 
  transactions, 
  accounts, 
  budgets 
}: { 
  transactions: Transaction[], 
  accounts: Account[], 
  budgets: Budget[] 
}) {
  const [insights, setInsights] = useState<SpendingInsightsOutput | null>(null);
  const [recommendations, setRecommendations] = useState<BudgetRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Map transactions to the format expected by the GenAI flow
      const mappedTransactions = transactions.map(t => ({
        id: t.id,
        date: t.date.split('T')[0],
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        category: t.category,
        account: accounts.find(a => a.id === t.accountId)?.name || 'Unknown'
      }));

      const res = await analyzeSpendingHabits(mappedTransactions);
      setInsights(res);

      const budgetInput = {
        currentBudget: {
          totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          categories: budgets.map(b => ({ name: b.category, allocatedAmount: b.amount }))
        },
        spendingHistory: mappedTransactions
      };

      const recs = await budgetRecommendations(budgetInput);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!insights && (
        <Card className="bg-primary/5 border-dashed border-2 border-primary/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
              <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Unlock AI Spending Insights</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Let our AI analyze your transactions to find trends, potential savings, and personalized budget adjustments.
            </p>
            <Button size="lg" onClick={handleAnalyze} disabled={loading} className="gap-2">
              <Sparkles className="w-5 h-5" />
              {loading ? "Analyzing Financial Data..." : "Generate Insights"}
            </Button>
          </CardContent>
        </Card>
      )}

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{insights.summary}</p>
              
              <div className="mt-8 space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Spending Trends</h4>
                {insights.spendingTrends.map((trend, i) => (
                  <div key={i} className="flex gap-3 items-start bg-secondary/30 p-4 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Optimization Alerts
              </CardTitle>
              <CardDescription>Recommendations based on your patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recommendations?.overspendingAlerts.length ? (
                <div className="space-y-3">
                  {recommendations.overspendingAlerts.map((alert, i) => (
                    <div key={i} className="bg-destructive/5 border border-destructive/10 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="destructive">{alert.category}</Badge>
                        <span className="text-sm font-bold text-destructive">
                          Over by ${(alert.spentAmount - alert.allocatedAmount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-destructive/80 leading-snug">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-accent/5 border border-accent/10 p-6 rounded-xl text-center">
                  <p className="text-accent font-semibold">No significant overspending detected!</p>
                  <p className="text-sm text-muted-foreground mt-1">Keep up the good work.</p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Actionable Suggestions</h4>
                {insights.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-3 items-center bg-primary/5 p-4 rounded-xl">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm font-medium">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}