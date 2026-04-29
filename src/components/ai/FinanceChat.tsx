"use client"

import { useState, useRef, useEffect } from "react";
import { financeChat, FinanceChatOutput } from "@/ai/flows/finance-chat";
import { useFinance } from "@/hooks/use-finance";
import { CATEGORIES } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'bot';
  content: string;
  isTransaction?: boolean;
}

export function FinanceChat() {
  const { accounts, addTransaction, user } = useFinance();
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
        // Automatically add the transaction
        await addTransaction({
          ...response.extractedTransaction,
          date: new Date().toISOString(),
        });

        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `✅ I've automatically updated your ${response.extractedTransaction?.category} records with $${response.extractedTransaction?.amount}!`,
          isTransaction: true 
        }]);

        toast({
          title: "Transaction Recorded",
          description: `Automatically added $${response.extractedTransaction.amount} to ${response.extractedTransaction.category}.`,
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
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden mac-card flex flex-col h-[600px]">
      <CardHeader className="p-6 bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-foreground">Financial Assistant</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Always Active AI</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
            msg.role === 'user' ? "flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
              msg.role === 'user' 
                ? "bg-accent text-white rounded-tr-none" 
                : msg.isTransaction 
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-tl-none font-bold italic"
                  : "bg-secondary text-foreground rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground italic text-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            SmartBot is thinking...
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t border-primary/10 bg-background/50 backdrop-blur-md">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="Tell me about an expense..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="rounded-xl h-12 pr-12 bg-white dark:bg-slate-900 border-none shadow-sm font-medium"
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            className="absolute right-1 top-1 h-10 w-10 rounded-lg shadow-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
