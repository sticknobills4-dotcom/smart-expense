"use client"

import { useState, useRef, useEffect } from "react";
import { financeChat, FinanceChatOutput } from "@/ai/flows/finance-chat";
import { useFinance } from "@/hooks/use-finance";
import { CATEGORIES } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'bot';
  content: string;
  isTransaction?: boolean;
}

export function FinanceChat() {
  const { accounts, addTransaction } = useFinance();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hi! I'm SmartBot. How can I help you with your finances today? You can ask me questions or just tell me about an expense you just made!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const chatInput = {
        message: userMessage,
        accounts: accounts.map(a => ({ id: a.id, name: a.name, type: a.type })),
        categories: CATEGORIES,
      };

      const response = await financeChat(chatInput);
      
      setMessages(prev => [...prev, { role: 'bot', content: response.text }]);

      if (response.extractedTransaction) {
        await addTransaction({
          ...response.extractedTransaction,
          date: new Date().toISOString(),
        });

        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `✅ I've automatically updated your ${response.extractedTransaction?.category} records with ₹${response.extractedTransaction?.amount}!`,
          isTransaction: true 
        }]);

        toast({
          title: "Transaction Recorded",
          description: `Automatically added ₹${response.extractedTransaction.amount} to ${response.extractedTransaction.category}.`,
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] md:h-[600px] relative">
      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden mac-card flex flex-col h-full bg-background/50 dark:bg-card/40">
        <CardHeader className="p-4 md:p-6 bg-primary/5 border-b border-primary/10 shrink-0">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Bot className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="font-black text-foreground text-sm md:text-base">Financial Assistant</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">SmartBot AI</p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-24 md:pb-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
              )}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-xs md:text-sm font-medium leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : msg.isTransaction 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-tl-none font-bold italic"
                    : "bg-secondary dark:bg-slate-800 text-foreground rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground italic text-[10px] animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-[74px] left-0 right-0 md:absolute md:bottom-0 p-3 md:p-4 border-t border-primary/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-[45] md:rounded-b-[2rem] w-full max-w-5xl mx-auto">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="Tell me about an expense..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="rounded-xl h-10 md:h-12 pr-12 bg-slate-100 dark:bg-slate-900 border-none shadow-inner font-medium text-foreground text-xs md:text-sm"
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            className="absolute right-1 top-1 h-8 md:h-10 w-8 md:w-10 rounded-lg shadow-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
