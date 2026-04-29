
"use client"

import React, { useMemo, useEffect, useState } from 'react';
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
  ChevronRight,
  Sun,
  Moon
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
import { useTheme } from '@/components/theme-provider';

const navItems = [
  { label: 'Dash', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Trans', icon: ArrowUpRight, href: '/transactions' },
  { label: 'Wallet', icon: Wallet, href: '/accounts' },
  { label: 'Budget', icon: PieChart, href: '/budgets' },
  { label: 'Saving', icon: Target, href: '/savings' },
  { label: 'AI', icon: BrainCircuit, href: '/insights' },
];

const desktopNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Transactions', icon: ArrowUpRight, href: '/transactions' },
  { label: 'Accounts', icon: Wallet, href: '/accounts' },
  { label: 'Budgets', icon: PieChart, href: '/budgets' },
  { label: 'Savings', icon: Target, href: '/savings' },
  { label: 'Insights', icon: BrainCircuit, href: '/insights' },
];

const NavItem = React.memo(({ item, isActive }: { item: typeof desktopNavItems[0], isActive: boolean }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative",
        isActive 
          ? "bg-primary text-white shadow-md shadow-primary/20" 
          : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-4.5 h-4.5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
        <span className="text-sm font-semibold">{item.label}</span>
      </div>
      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
    </Link>
  );
});
NavItem.displayName = 'NavItem';

export function Navbar({ user }: { user: any }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navigation = useMemo(() => desktopNavItems.map((item) => (
    <NavItem key={item.href} item={item} isActive={pathname === item.href} />
  )), [pathname]);

  const mobileNavigation = useMemo(() => navItems.map((item) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center gap-1 transition-all duration-300 px-0.5 py-1 flex-1",
          isActive ? "text-primary scale-105" : "text-slate-400 dark:text-slate-500"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
        <span className="text-[8px] font-black tracking-tight text-center uppercase">{item.label}</span>
      </Link>
    );
  }), [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 mac-sidebar h-screen fixed left-0 top-0 z-40">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">SmartExpense</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          <div className="px-4 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Main Menu</span>
          </div>
          {navigation}
        </nav>

        <div className="p-6 border-t border-slate-200/50 dark:border-white/5 space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full justify-start gap-3 px-3 py-2 hover:bg-slate-200/40 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            <span className="text-sm font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-8 hover:bg-slate-200/40 dark:hover:bg-white/5 rounded-3xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-left">
                  <span className="text-xs font-bold truncate w-full text-slate-800 dark:text-white">{user?.displayName || 'User'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full font-medium">{user?.email}</span>
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

      {/* Mobile Top Floating Avatar */}
      <div className={cn(
        "md:hidden fixed top-4 left-4 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 w-11 p-0 rounded-full border-2 border-white dark:border-slate-800 shadow-lg bg-white/80 dark:bg-black/80 backdrop-blur-md overflow-hidden active:scale-90 transition-transform">
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 mac-glass rounded-[2.5rem] p-5 mt-2 ml-2 shadow-2xl border-white/40 dark:border-white/10">
            <div className="space-y-1 mb-5 px-1">
              <p className="text-base font-black text-slate-800 dark:text-white tracking-tight">{user?.displayName || 'Smart User'}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-wide">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-100/50 dark:bg-white/5 mb-3" />
            <DropdownMenuItem 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-2xl px-4 py-3 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
              <span className="font-black text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => signOut(auth)} 
              className="text-destructive focus:text-destructive focus:bg-destructive/5 rounded-2xl px-4 py-3 cursor-pointer"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-black text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t flex justify-around items-center h-20 px-1 z-50 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {mobileNavigation}
      </nav>
    </>
  );
}
