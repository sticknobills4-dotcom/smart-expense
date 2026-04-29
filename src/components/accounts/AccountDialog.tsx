"use client"

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
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
import { Account, AccountType } from "@/types/finance";

export function AccountDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Account;
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<AccountType>('Bank');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setType(initialData.type);
      } else {
        setType('Bank');
      }
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: type,
      balance: Number(formData.get('balance')),
      currency: 'USD'
    };

    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? 'Edit Account' : 'New Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name} 
              placeholder="e.g. Personal Checking" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as AccountType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank">Bank Account</SelectItem>
                <SelectItem value="Cash">Cash / Wallet</SelectItem>
                <SelectItem value="Savings">Savings Account</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Investment">Investment Portfolio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Account Balance</Label>
            <Input 
              id="balance" 
              name="balance" 
              type="number" 
              step="0.01" 
              defaultValue={initialData?.balance || 0} 
              required 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Saving..." : (initialData ? "Update Account" : "Create Account")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
