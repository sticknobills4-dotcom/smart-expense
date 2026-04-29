
"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { format } from "date-fns";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Search,
  Trash2,
  Edit2,
  MoreVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/finance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const { user, transactions, accounts, loading, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const s = search.toLowerCase();
    return transactions.filter(t => 
      (t.category?.toLowerCase() || "").includes(s) || 
      (t.description?.toLowerCase() || "").includes(s)
    );
  }, [transactions, search]);

  if (loading || !user) return <div className="p-10 text-center text-muted-foreground animate-pulse font-medium italic">Loading your history...</div>;

  const handleEditClick = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-6 md:space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 ml-14 md:ml-0">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Transactions</h1>
              <p className="text-xs md:text-base text-muted-foreground font-medium italic">Comprehensive log of your financial journey.</p>
            </div>
            <div className="flex">
              <TransactionDialog accounts={accounts} onSubmit={addTransaction} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-12 h-12 md:h-14 bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl text-base font-medium focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Compact Mobile List View (Hidden on Desktop) */}
          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <div key={t.id} className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                    t.type === 'income' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" : 
                    t.type === 'expense' ? "bg-red-50 dark:bg-red-950/30 text-red-600" : 
                    "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600"
                  )}>
                    {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : 
                     t.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : 
                     <ArrowLeftRight className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{t.category || 'General'}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {format(new Date(t.date), 'MMM dd')} • {accounts.find(a => a.id === t.accountId)?.name || 'Account'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <p className={cn(
                    "font-black text-base tracking-tighter",
                    t.type === 'income' ? "text-emerald-500" : t.type === 'expense' ? "text-red-500" : "text-indigo-500"
                  )}>
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl mac-glass">
                      <DropdownMenuItem onClick={() => handleEditClick(t)} className="gap-2 font-bold py-3">
                        <Edit2 className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { if (confirm("Delete this transaction?")) deleteTransaction(t.id); }}
                        className="gap-2 font-bold py-3 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground font-medium italic">No transactions found.</div>
            )}
          </div>

          {/* Detailed Table View (Hidden on Mobile) */}
          <div className="hidden md:block bg-white dark:bg-card/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-white/5 overflow-hidden mac-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Type</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Account</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Date</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Amount</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110",
                        t.type === 'income' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" : 
                        t.type === 'expense' ? "bg-red-50 dark:bg-red-950/30 text-red-600" : 
                        "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-6 h-6" /> : 
                         t.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> : 
                         <ArrowLeftRight className="w-6 h-6" />}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-foreground leading-tight text-base">{t.category || 'Uncategorized'}</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1 truncate max-w-[200px]">{t.description || 'No description'}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full uppercase tracking-tighter w-fit border border-slate-200 dark:border-white/10">
                        {accounts.find(a => a.id === t.accountId)?.name || 'Account'}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-black text-muted-foreground">
                      {format(new Date(t.date), 'MMM dd, yyyy')}
                    </td>
                    <td className={cn(
                      "p-6 text-right font-black text-xl tracking-tighter",
                      t.type === 'income' ? "text-emerald-500" : t.type === 'expense' ? "text-red-500" : "text-indigo-500"
                    )}>
                      {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl"
                          onClick={() => handleEditClick(t)}
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl"
                          onClick={() => {
                            if (confirm("Delete this transaction?")) {
                              deleteTransaction(t.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <TransactionDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        accounts={accounts} 
        initialData={selectedTransaction}
        trigger={null}
        onSubmit={async (data) => {
          if (selectedTransaction) updateTransaction(selectedTransaction.id, data);
        }}
      />
    </div>
  );
}
