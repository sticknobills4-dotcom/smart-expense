"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  Wallet, 
  PieChart, 
  BrainCircuit,
  LogOut,
  Target,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Transactions', icon: ArrowUpRight, href: '/transactions' },
  { label: 'Accounts', icon: Wallet, href: '/accounts' },
  { label: 'Budgets', icon: PieChart, href: '/budgets' },
  { label: 'Savings', icon: Target, href: '/savings' },
  { label: 'Insights', icon: BrainCircuit, href: '/insights' },
];

export function Navbar({ user }: { user: any }) {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <>
      {/* Desktop MacOS Sidebar */}
      <aside className="hidden md:flex flex-col w-64 mac-sidebar h-screen fixed left-0 top-0 z-40 transition-all duration-500">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground/90">SmartExpense</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          <div className="px-4 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigation</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground/80 hover:bg-white/40 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30 bg-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-7 hover:bg-white/30 rounded-2xl transition-all">
                <Avatar className="h-9 w-9 border border-white/50 shadow-sm">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="text-xs font-bold truncate w-full opacity-90">{user?.displayName || 'User'}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full font-medium">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mac-glass rounded-2xl">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg m-1">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 mac-glass border-t flex justify-around items-center h-16 px-6 z-50 rounded-t-[2rem]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground opacity-70"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Header for mobile */}
      <header className="md:hidden sticky top-0 bg-background/80 backdrop-blur-xl border-b h-16 flex items-center justify-between px-6 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tighter">SmartExpense</span>
        </Link>
        <Avatar className="h-8 w-8 ring-2 ring-primary/10">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback className="text-[10px] font-bold">{user?.email?.charAt(0)}</AvatarFallback>
        </Avatar>
      </header>
    </>
  );
}
