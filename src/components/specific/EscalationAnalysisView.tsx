import * as React from "react"
import { Pie } from "react-chartjs-2"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { ChartBox } from "../shared/ChartBox"

interface EscalationAnalysisViewProps {
  analysis: any
}

export function EscalationAnalysisView({ analysis }: EscalationAnalysisViewProps) {
  if (!analysis) return null

  const { escalatedCasesList, bandejaCounts } = analysis
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const chartFontColor = isDarkMode ? "#cbd5e1" : "#475569"

  const chartData = {
    labels: Object.keys(bandejaCounts),
    datasets: [{
      label: '# de Casos',
      data: Object.values(bandejaCounts),
      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)', 'rgba(107, 33, 168, 0.7)'],
      borderColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderWidth: 2
    }]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <ChartBox title="Distribución de Escalados por Bandeja" height="h-[400px]" className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <Pie 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: chartFontColor } },
            }
          }} 
        />
      </ChartBox>
      
      <Card className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-6">Detalle de Escalados ({escalatedCasesList.length})</h2>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-200 dark:bg-slate-700 sticky top-0">
              <TableRow>
                <TableHead className="p-3 font-semibold">Caso Padre</TableHead>
                <TableHead className="p-3 font-semibold">Caso Hijo</TableHead>
                <TableHead className="p-3 font-semibold">Bandeja Destino</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalatedCasesList.map((c: any, i: number) => (
                <TableRow key={i} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <TableCell className="p-3 align-top text-slate-600 dark:text-slate-300">
                    <div dangerouslySetInnerHTML={{ __html: c.parentCase }} />
                  </TableCell>
                  <TableCell className="p-3 align-top text-slate-600 dark:text-slate-300">
                    <div dangerouslySetInnerHTML={{ __html: c.childCase }} />
                  </TableCell>
                  <TableCell className="p-3 align-top font-medium text-slate-800 dark:text-slate-300">{c.destinationBandeja}</TableCell>
                </TableRow>
              ))}
              {escalatedCasesList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="p-4 text-center text-slate-500">No se encontraron casos escalados en este período.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
