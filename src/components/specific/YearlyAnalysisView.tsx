import * as React from "react"
import { Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { CalendarDays, TrendingUp, Clock } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface YearlyAnalysisViewProps {
  analysis: {
    monthlyData: Record<string, number[]>;
    year: number;
  }
}

export function YearlyAnalysisView({ analysis }: YearlyAnalysisViewProps) {
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  
  if (!analysis || !analysis.monthlyData) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full"><CalendarDays className="w-8 h-8 text-muted-foreground opacity-20" /></div>
        <p className="text-sm text-muted-foreground max-w-xs">Carga los datos históricos para ver la comparativa anual.</p>
      </div>
    )
  }

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const colors = {
    emerald: isDarkMode ? '#10B981' : '#18864B',
    indigo: isDarkMode ? '#6B82F6' : '#2943A3',
    amber: isDarkMode ? '#F59E0B' : '#E59200',
    sky: isDarkMode ? '#0EA5E9' : '#0284C7',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    text: isDarkMode ? '#f8fafc' : '#0f172a'
  }

  const colorPalette = [colors.emerald, colors.indigo, colors.amber, colors.sky]

  const data = {
    labels: months,
    datasets: Object.entries(analysis.monthlyData).map(([label, values], i) => ({
      label,
      data: values,
      borderColor: colorPalette[i % 4],
      backgroundColor: colorPalette[i % 4] + '15', // Relleno suave bajo la línea
      fill: true,
      tension: 0.4, // Curva suave
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: colors.text, usePointStyle: true, font: { size: 11, weight: '600' } }
      },
      tooltip: {
        padding: 12,
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#ffffff' : '#0f172a',
        bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
        borderColor: colors.grid,
        borderWidth: 1,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: colors.text } },
      y: { grid: { color: colors.grid }, ticks: { color: colors.text }, beginAtZero: true }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="bento-card p-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-brand-indigo/5 to-transparent">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2"><TrendingUp className="w-6 h-6 text-brand-indigo" />Evolución Histórica ({analysis.year})</h2>
          <p className="text-sm text-muted-foreground">Tendencias de resolución mensual por categorías SLA</p>
        </div>
      </div>

      <Card className="bento-card overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-border/50">
           <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nivel de Servicio Mensual</CardTitle>
            <Clock className="w-4 h-4 text-brand-indigo opacity-50" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[450px] w-full"><Line data={data} options={options} /></div>
        </CardContent>
      </Card>

      <Card className="bento-card overflow-hidden">
        <CardContent className="p-0 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader><TableRow className="bg-slate-50 dark:bg-zinc-900 sticky top-0">
              <TableHead className="pl-6 text-[10px] uppercase font-bold">Mes</TableHead>
              {Object.keys(analysis.monthlyData).map(k => (<TableHead key={k} className="text-center text-[10px] uppercase font-bold">{k}</TableHead>))}
            </TableRow></TableHeader>
            <TableBody>
              {months.map((m, idx) => (
                <TableRow key={m} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 border-b border-border/40 transition-colors">
                  <TableCell className="pl-6 py-3 font-bold text-foreground">{m}</TableCell>
                  {Object.values(analysis.monthlyData).map((v, i) => (
                    <TableCell key={i} className="text-center tabular-nums font-medium text-foreground/70">
                      {v[idx] > 0 ? <span className={`metric-pill ${i === 0 ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-slate-100 dark:bg-zinc-800'}`}>{v[idx]}</span> : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
