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
      <aside className="hidden md:flex flex-col w-64 mac-sidebar h-screen fixed left-0 top-0 z-40">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">SmartExpense</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          <div className="px-4 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Main Menu</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4.5 h-4.5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-200/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-8 hover:bg-slate-200/40 rounded-3xl transition-all border border-transparent hover:border-slate-200">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="text-xs font-bold truncate w-full text-slate-800">{user?.displayName || 'User'}</span>
                  <span className="text-[10px] text-slate-500 truncate w-full font-medium">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mac-glass rounded-3xl p-2">
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400">Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl m-1 px-3 py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-semibold">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t flex justify-around items-center h-20 px-6 z-50 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 px-2 py-1",
                isActive ? "text-primary scale-110" : "text-slate-400"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Header for mobile */}
      <header className="md:hidden sticky top-0 glass-nav h-16 flex items-center justify-between px-6 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tighter text-slate-800">SmartExpense</span>
        </Link>
        <Avatar className="h-8 w-8 ring-2 ring-primary/10">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback className="text-[10px] font-bold">{user?.email?.charAt(0)}</AvatarFallback>
        </Avatar>
      </header>
    </>
  );
}