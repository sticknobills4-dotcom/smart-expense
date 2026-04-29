"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Trash2, Wallet, Edit2 } from "lucide-react";
import { AccountDialog } from "@/components/accounts/AccountDialog";
import { useState } from "react";
import { Account } from "@/types/finance";

export default function AccountsPage() {
  const { user, accounts, loading, deleteAccount, addAccount, updateAccount } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();

  if (loading || !user) return <div className="p-10">Loading accounts...</div>;

  const handleEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAccount(undefined);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedAccount) {
      updateAccount(selectedAccount.id, data);
    } else {
      addAccount(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Financial Accounts</h1>
            <div className="flex">
              <Button onClick={handleAddNew} className="gap-2 w-full sm:w-auto">
                <Plus className="w-5 h-5" />
                Add Account
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <Card key={acc.id} className="border-none shadow-sm relative group overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary h-8 w-8"
                        onClick={() => handleEdit(acc)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => {
                          if (confirm("Delete this account?")) deleteAccount(acc.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold truncate">{acc.name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{acc.type}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Available Balance</span>
                    <span className="text-2xl md:text-3xl font-black text-primary truncate">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
              </Card>
            ))}

            {accounts.length === 0 && (
              <div className="col-span-full py-16 md:py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No accounts connected</h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-xs mx-auto mt-2">Add your first account to start tracking your wealth.</p>
                <Button onClick={handleAddNew} variant="outline" className="mt-6">Create Account</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AccountDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={selectedAccount}
        onSubmit={handleSubmit} 
      />
    </div>
  );
}
