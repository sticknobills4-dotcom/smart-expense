"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { BalanceOverview } from "@/components/dashboard/BalanceOverview";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  TrendingUp,
  CreditCard,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/components/accounts/AccountDialog";

export default function DashboardPage() {
  const { user, accounts, transactions, loading, addTransaction, addAccount, isUserLoading } = useFinance();
  const router = useRouter();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 border-r hidden md:block" />
        <div className="flex-1 p-8 space-y-6 bg-background">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.displayName || 'User'}</p>
            </div>
            <TransactionDialog accounts={accounts} onSubmit={addTransaction} />
          </div>

          <BalanceOverview accounts={accounts} transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <button onClick={() => router.push('/transactions')} className="text-sm text-primary font-semibold hover:underline">
                    View All
                  </button>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                  <div className="space-y-1">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                              t.type === 'income' ? "bg-accent/10 text-accent" : 
                              t.type === 'expense' ? "bg-destructive/10 text-destructive" : 
                              "bg-primary/10 text-primary"
                            )}>
                              {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : 
                               t.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : 
                               <ArrowLeftRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold leading-none mb-1">{t.category || t.description || 'Transaction'}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <p className={cn(
                            "font-bold",
                            t.type === 'income' ? "text-accent" : t.type === 'expense' ? "text-destructive" : "text-primary"
                          )}>
                            {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-muted-foreground">No recent transactions found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Accounts</CardTitle>
                  <button 
                    onClick={() => setIsAccountDialogOpen(true)} 
                    className="p-1 hover:bg-secondary rounded-full transition-colors"
                  >
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">{acc.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{acc.type}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground italic">Add your first account to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <TrendingUp className="w-8 h-8 opacity-50" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-none">Pro Tip</Badge>
                  </div>
                  <h4 className="text-lg font-bold mb-2">Smart Savings</h4>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Users who categorize every transaction save 20% more on average. Start your journey today!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AccountDialog 
        open={isAccountDialogOpen} 
        onOpenChange={setIsAccountDialogOpen} 
        onSubmit={(data) => {
          addAccount(data);
        }} 
      />
    </div>
  );
}
