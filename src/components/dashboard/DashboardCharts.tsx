
"use client"

import { useMemo } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Transaction } from "@/types/finance"
import { cn } from "@/lib/utils"

export function DashboardCharts({ transactions }: { transactions: Transaction[] }) {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense')
    const counts: Record<string, number> = {}
    
    expenses.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + t.amount
    })

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [transactions])

  const monthlyData = useMemo(() => {
    const last6Months: Record<string, { month: string, income: number, expense: number }> = {}
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short' })
      last6Months[key] = { month: label, income: 0, expense: 0 }
    }

    transactions.forEach(t => {
      const key = t.date.substring(0, 7)
      if (last6Months[key]) {
        if (t.type === 'income') last6Months[key].income += t.amount
        if (t.type === 'expense') last6Months[key].expense += t.amount
      }
    })

    return Object.values(last6Months)
  }, [transactions])

  const COLORS = [
    'hsl(var(--primary))', 
    'hsl(var(--accent))', 
    '#6366f1', 
    '#10b981', 
    '#8b5cf6', 
    '#34d399'
  ]

  if (transactions.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-0">
          <CardTitle className="text-xl font-black text-foreground">Spending Mix</CardTitle>
          <CardDescription>Top expense categories</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 flex flex-col items-center">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/5">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{payload[0].name}</p>
                          <p className="text-xl font-black text-foreground">₹{Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 w-full px-4">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black text-muted-foreground uppercase truncate tracking-wider">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-0">
          <CardTitle className="text-xl font-black text-foreground">Cash Flow</CardTitle>
          <CardDescription>Monthly Income vs Expenses</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="h-[250px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-black/5 space-y-3">
                          <p className="text-[11px] font-black text-foreground border-b dark:border-slate-800 pb-2 mb-2">{(payload[0]?.payload as any).month}</p>
                          {payload.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-8">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{p.name}</span>
                              </div>
                              <span className={cn("text-sm font-black tracking-tight", p.name === 'income' ? 'text-emerald-500' : 'text-primary')}>
                                ₹{Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="income" name="income" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="expense" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expenses</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
