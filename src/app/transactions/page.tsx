
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
  Edit2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/finance";

export default function TransactionsPage() {
  const { user, transactions, accounts, loading, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Memoize filtered results to keep filtering snappy
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
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Transactions</h1>
              <p className="text-slate-500 font-medium italic">Comprehensive log of your financial journey.</p>
            </div>
            <TransactionDialog accounts={accounts} onSubmit={addTransaction} />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Find a category or purchase..." 
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden mac-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/50">
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Type</th>
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Description</th>
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Account</th>
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Date</th>
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 text-right">Amount</th>
                    <th className="p-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="p-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110",
                          t.type === 'income' ? "bg-emerald-50 text-emerald-600" : 
                          t.type === 'expense' ? "bg-red-50 text-red-600" : 
                          "bg-indigo-50 text-indigo-600"
                        )}>
                          {t.type === 'income' ? <ArrowDownLeft className="w-6 h-6" /> : 
                           t.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> : 
                           <ArrowLeftRight className="w-6 h-6" />}
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="font-black text-slate-900 leading-tight">{t.category || 'Uncategorized'}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{t.description || 'No description'}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-tighter w-fit border border-slate-200">
                            {accounts.find(a => a.id === t.accountId)?.name || 'Account'}
                          </span>
                          {t.type === 'transfer' && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-black italic">
                              → {accounts.find(a => a.id === t.toAccountId)?.name || '...'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-sm font-black text-slate-500">
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
                            className="h-10 w-10 text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                            onClick={() => handleEditClick(t)}
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                            onClick={() => {
                              if (confirm("Delete this transaction? Your account balances will be adjusted automatically.")) {
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
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-32 text-center">
                        <p className="text-slate-300 font-black italic text-xl">Quiet as a mouse. No transactions here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <TransactionDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        accounts={accounts} 
        initialData={selectedTransaction}
        onSubmit={async (data) => {
          if (selectedTransaction) updateTransaction(selectedTransaction.id, data);
        }}
      />
    </div>
  );
}
