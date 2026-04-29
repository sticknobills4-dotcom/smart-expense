
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
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      amount: Number(formData.get('amount')),
      accountId: formData.get('accountId') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      date: initialData?.date || new Date().toISOString(),
      ...(type === 'transfer' && { toAccountId: formData.get('toAccountId') as string })
    };

    try {
      await onSubmit(data);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <PlusCircle className="w-5 h-5" />
            <span>New Transaction</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {initialData ? 'Edit Transaction' : 'Record Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex bg-secondary p-1 rounded-lg">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                  type === t ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                className="pl-8 text-xl font-bold" 
                placeholder="0.00"
                defaultValue={initialData?.amount}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select name="accountId" defaultValue={initialData?.accountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {type === 'transfer' ? (
              <div className="space-y-2">
                <Label>To Account</Label>
                <Select name="toAccountId" defaultValue={initialData?.toAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" defaultValue={initialData?.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional notes..." defaultValue={initialData?.description} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Processing..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
