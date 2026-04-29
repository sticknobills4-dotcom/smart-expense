"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Trash2, Wallet } from "lucide-react";
import { AccountDialog } from "@/components/accounts/AccountDialog";
import { useState } from "react";
import { Account } from "@/types/finance";

export default function AccountsPage() {
  const { user, accounts, loading, deleteAccount, addAccount } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (loading || !user) return <div className="p-10">Loading accounts...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Financial Accounts</h1>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              Add Account
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <Card key={acc.id} className="border-none shadow-sm relative group overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm("Delete this account?")) deleteAccount(acc.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-bold">{acc.name}</CardTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{acc.type}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium">Available Balance</span>
                    <span className="text-3xl font-black text-primary">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
              </Card>
            ))}

            {accounts.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No accounts connected</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Add your first account to start tracking your wealth.</p>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-6">Create Account</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AccountDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSubmit={async (data) => {
          addAccount(data);
          setIsDialogOpen(false);
        }} 
      />
    </div>
  );
}
