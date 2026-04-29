
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
  Plus,
  LayoutGrid
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
      <div className="flex min-h-screen bg-slate-50">
        <div className="w-64 border-r hidden md:block" />
        <div className="flex-1 p-4 md:p-8 space-y-6">
          <Skeleton className="h-10 w-48 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-24 md:pb-12">
        <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium">Monitoring your financial health, {user.displayName?.split(' ')[0] || 'Member'}.</p>
            </div>
            <div className="flex">
              <TransactionDialog accounts={accounts} onSubmit={addTransaction} />
            </div>
          </div>

          <BalanceOverview accounts={accounts} transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <ArrowLeftRight className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl">Recent Activity</CardTitle>
                  </div>
                  <button 
                    onClick={() => router.push('/transactions')} 
                    className="text-xs md:text-sm text-primary font-bold hover:bg-indigo-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all"
                  >
                    All
                  </button>
                </CardHeader>
                <CardContent className="px-4 md:px-8 pb-6 md:pb-8">
                  <div className="space-y-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-3 md:gap-5 min-w-0">
                            <div className={cn(
                              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm shrink-0",
                              t.type === 'income' ? "bg-emerald-50 text-emerald-600" : 
                              t.type === 'expense' ? "bg-red-50 text-red-600" : 
                              "bg-indigo-50 text-indigo-600"
                            )}>
                              {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6" /> : 
                               t.type === 'expense' ? <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" /> : 
                               <ArrowLeftRight className="w-5 h-5 md:w-6 md:h-6" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 mb-0.5 truncate">{t.category || t.description || 'General'}</p>
                              <p className="text-[10px] md:text-xs text-slate-400 font-semibold">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <p className={cn(
                            "font-black text-base md:text-lg shrink-0 ml-2",
                            t.type === 'income' ? "text-emerald-500" : t.type === 'expense' ? "text-red-500" : "text-indigo-500"
                          )}>
                            {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 md:py-20 text-center space-y-3">
                        <LayoutGrid className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto" />
                        <p className="text-slate-400 font-medium italic">No transactions captured yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6 md:space-y-8">
              <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem]">
                <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8 pb-4">
                  <CardTitle className="text-lg md:text-xl">My Wallets</CardTitle>
                  <button 
                    onClick={() => setIsAccountDialogOpen(true)} 
                    className="p-2 hover:bg-indigo-50 rounded-xl transition-all text-primary"
                  >
                    <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </CardHeader>
                <CardContent className="px-6 md:px-8 pb-6 md:pb-8 space-y-4">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-all shrink-0">
                          <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-black text-slate-800 leading-tight truncate">{acc.name}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{acc.type}</p>
                        </div>
                      </div>
                      <p className="font-black text-sm md:text-base text-slate-900 shrink-0 ml-2">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium italic">Ready to link your first account?</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-primary text-white rounded-[2rem] overflow-hidden group">
                <CardContent className="p-6 md:p-8 relative">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <TrendingUp className="w-8 h-8 md:w-10 md:h-10 opacity-40 group-hover:scale-110 transition-transform" />
                      <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] md:text-xs">Premium Advice</Badge>
                    </div>
                    <h4 className="text-xl md:text-2xl font-black mb-2 md:mb-3 leading-tight">Master Your Flow</h4>
                    <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed opacity-90">
                      Smart categorization helps the AI predict your needs better. Keep your data clean!
                    </p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AccountDialog 
        open={isAccountDialogOpen} 
        onOpenChange={setIsAccountDialogOpen} 
        onSubmit={async (data) => {
          await addAccount(data);
        }} 
      />
    </div>
  );
}
