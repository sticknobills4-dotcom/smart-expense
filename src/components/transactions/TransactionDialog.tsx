"use client"

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Account, CATEGORIES, TransactionType, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";

export function TransactionDialog({ 
  accounts, 
  onSubmit,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  initialData,
  trigger
}: { 
  accounts: Account[], 
  onSubmit: (data: any) => Promise<void>,
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  initialData?: Transaction,
  trigger?: React.ReactNode | null
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCategory(initialData.category);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const finalCategory = category === 'Custom' ? customCategory : category;

    const data = {
      type,
      amount: Number(formData.get('amount')),
      accountId: formData.get('accountId') as string,
      category: finalCategory,
      description: formData.get('description') as string,
      date: initialData?.date || new Date().toISOString(),
      ...(type === 'transfer' && { toAccountId: formData.get('toAccountId') as string })
    };

    try {
      await onSubmit(data);
      setOpen(false);
      setCustomCategory('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2 shadow-xl shadow-primary/20 rounded-xl px-6">
              <PlusCircle className="w-4 h-4" />
              <span className="font-bold">New Transaction</span>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] mac-glass rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center mb-4">
            {initialData ? 'Edit Transaction' : 'Record Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-secondary/50 p-1.5 rounded-2xl">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 text-xs font-black rounded-xl transition-all capitalize tracking-tight",
                  type === t ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                className="pl-9 h-14 text-2xl font-black rounded-2xl border-none bg-secondary/30 focus:bg-white transition-all" 
                placeholder="0.00"
                defaultValue={initialData?.amount}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Account</Label>
              <Select name="accountId" defaultValue={initialData?.accountId} required>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {type === 'transfer' ? (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">To Account</Label>
                <Select name="toAccountId" defaultValue={initialData?.toAccountId} required>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {category === 'Custom' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="customCategory" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Custom Category Name</Label>
              <Input 
                id="customCategory" 
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Subscriptions" 
                className="h-12 rounded-xl bg-secondary/30 border-none"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Description</Label>
            <Input id="description" name="description" placeholder="Add a note..." defaultValue={initialData?.description} className="h-12 rounded-xl bg-secondary/30 border-none" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20" disabled={loading}>
              {loading ? "Processing..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
