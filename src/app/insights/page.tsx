"use client"

import { useFinance } from "@/hooks/use-finance";
import { Navbar } from "@/components/layout/Navbar";
import { SmartInsights } from "@/components/ai/SmartInsights";
import { FinanceChat } from "@/components/ai/FinanceChat";
import { Sparkles, Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InsightsPage() {
  const { user, transactions, accounts, budgets, loading } = useFinance();

  if (loading || !user) return <div className="p-10 text-center animate-pulse text-muted-foreground font-medium">Loading Intelligence...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10">
          <div className="flex items-center justify-between gap-3 ml-14 md:ml-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Intelligence</h1>
                <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-70">AI Financial Core</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="chat" className="space-y-8">
            <div className="flex justify-center md:justify-start">
              <TabsList className="bg-secondary/50 p-1 rounded-2xl h-14 w-full md:w-auto">
                <TabsTrigger value="chat" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm gap-2">
                  <Bot className="w-4 h-4" />
                  Smart Assistant
                </TabsTrigger>
                <TabsTrigger value="analysis" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm gap-2">
                  <Sparkles className="w-4 h-4" />
                  Deep Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                    <p className="text-sm font-bold text-primary">Pro Tip:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Try saying: <span className="italic font-medium text-foreground">"I just spent 15 on coffee using my bank account"</span> or <span className="italic font-medium text-foreground">"Tell me how I can save more money this month."</span>
                    </p>
                  </div>
                  <FinanceChat />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SmartInsights 
                transactions={transactions} 
                accounts={accounts} 
                budgets={budgets} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
