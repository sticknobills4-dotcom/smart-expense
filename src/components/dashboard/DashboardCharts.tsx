
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
  Legend 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Transaction, CATEGORIES } from "@/types/finance"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function DashboardCharts({ transactions }: { transactions: Transaction[] }) {
  // 1. Process Data for Category Pie Chart (Expenses only)
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

  // 2. Process Data for Income vs Expense Bar Chart
  const monthlyData = useMemo(() => {
    const last6Months: Record<string, { month: string, income: number, expense: number }> = {}
    
    // Get last 6 months keys
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
      {/* Category Breakdown Donut */}
      <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-0">
          <CardTitle className="text-xl font-black text-foreground">Spending Mix</CardTitle>
          <CardDescription>Top expense categories this period</CardDescription>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-black uppercase text-slate-400 mb-1">{payload[0].name}</p>
                          <p className="text-lg font-black text-primary">${Number(payload[0].value).toLocaleString()}</p>
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
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends Bar Chart */}
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
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-2">
                          {payload.map((p, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-[9px] font-black uppercase text-slate-400">{p.name}</span>
                              <span className={p.name === 'income' ? 'text-emerald-500 font-black' : 'text-primary font-black'}>
                                ${Number(p.value).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="income" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
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
