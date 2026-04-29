"use client"

import { useState } from "react";
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
import { AccountType } from "@/types/finance";

export function AccountDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> 
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as AccountType,
      balance: Number(formData.get('balance')),
      currency: 'USD'
    };

    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" placeholder="e.g. Personal Checking" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select name="type" required>
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
            <Label htmlFor="balance">Initial Balance</Label>
            <Input id="balance" name="balance" type="number" step="0.01" defaultValue="0" required />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
