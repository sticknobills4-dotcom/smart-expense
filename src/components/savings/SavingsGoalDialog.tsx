
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
import { SavingsGoal } from "@/types/finance";

export function SavingsGoalDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: SavingsGoal;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      targetAmount: Number(formData.get('targetAmount')),
      currentAmount: Number(formData.get('currentAmount')),
      targetDate: formData.get('targetDate') as string,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0]
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
          <DialogTitle className="text-2xl font-bold">
            {initialData ? 'Edit Savings Goal' : 'New Savings Goal'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" name="name" defaultValue={initialData?.name} placeholder="e.g. Dream House" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input id="targetAmount" name="targetAmount" type="number" step="0.01" defaultValue={initialData?.targetAmount} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Already Saved</Label>
              <Input id="currentAmount" name="currentAmount" type="number" step="0.01" defaultValue={initialData?.currentAmount || 0} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input id="targetDate" name="targetDate" type="date" defaultValue={initialData?.targetDate} required />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Saving..." : (initialData ? "Update Goal" : "Create Goal")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
