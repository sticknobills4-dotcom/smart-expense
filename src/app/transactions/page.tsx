"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { format } from "date-fns";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";

export default function TransactionsPage() {
  const { user, transactions, accounts, loading, addTransaction } = useFinance();
  const [search, setSearch] = useState("");

  if (loading || !user) return <div className="p-10">Loading transactions...</div>;

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <TransactionDialog accounts={accounts} onSubmit={addTransaction} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search category or description..." 
                className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="h-11 px-6 bg-white border-none shadow-sm rounded-xl flex items-center gap-2 font-semibold text-sm hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-secondary/20">
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Detail</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Account</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="p-5">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                          t.type === 'income' ? "bg-accent/10 text-accent" : 
                          t.type === 'expense' ? "bg-destructive/10 text-destructive" : 
                          "bg-primary/10 text-primary"
                        )}>
                          {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : 
                           t.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : 
                           <ArrowLeftRight className="w-5 h-5" />}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold leading-tight">{t.category || 'Uncategorized'}</p>
                        <p className="text-xs text-muted-foreground">{t.description || 'No description'}</p>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold px-3 py-1 bg-secondary rounded-full uppercase tracking-tighter">
                          {accounts.find(a => a.id === t.accountId)?.name || 'Account'}
                        </span>
                      </td>
                      <td className="p-5 text-sm font-medium text-muted-foreground">
                        {format(new Date(t.date), 'MMM dd, yyyy')}
                      </td>
                      <td className={cn(
                        "p-5 text-right font-black text-lg",
                        t.type === 'income' ? "text-accent" : t.type === 'expense' ? "text-destructive" : "text-primary"
                      )}>
                        {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium italic">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { cn } from "@/lib/utils";