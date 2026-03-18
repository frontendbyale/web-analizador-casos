import * as React from "react"
import { Bar } from "react-chartjs-2"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { ChartBox } from "../shared/ChartBox"

interface WeeklyAnalysisViewProps {
  analysis: any
}

export function WeeklyAnalysisView({ analysis }: WeeklyAnalysisViewProps) {
  if (!analysis) return null

  const { claimsByReason, nestedAnalysis, totalClaims, startDate } = analysis
  const startDateString = new Date(startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })

  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const chartFontColor = isDarkMode ? "#cbd5e1" : "#475569"

  const chartData = {
    labels: Object.keys(claimsByReason),
    datasets: [{
      label: 'Cantidad de Reclamos',
      data: Object.keys(claimsByReason).map(label => claimsByReason[label].length),
      backgroundColor: 'rgba(129, 140, 248, 0.7)',
      borderColor: 'rgba(129, 140, 248, 1)',
      borderWidth: 1
    }]
  }

  return (
    <div className="space-y-12">
      <Card className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">
          {totalClaims} Reclamos desde el {startDateString}
        </h2>
        
        <ChartBox title="Reclamos por Razón en la Última Semana" height="h-[400px]">
          <Bar 
            data={chartData} 
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { ticks: { color: chartFontColor } },
                y: { ticks: { color: chartFontColor } }
              }
            }} 
          />
        </ChartBox>
        
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-8 mb-4">Desglose por Razón (Lista de Casos)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(claimsByReason).map(([reason, cases]: [string, any]) => (
            <Card key={reason} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                {reason}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({cases.length} casos)</span>
              </h3>
              <ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">
                {cases.map((c: any, i: number) => {
                  const creationDate = new Date(c['Fecha de Creacion']).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  return (
                    <li key={i} className="text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-1 last:border-0">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{creationDate}</span> - 
                      <strong>Case #<span dangerouslySetInnerHTML={{ __html: c['caseHtml'] || c['Nro de Case'] }} />:</strong> {c['Subrazón'] || 'Sin subrazón'}
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">
          Análisis por Diagnóstico y Solución
        </h2>
        <div className="space-y-4">
          {Object.keys(nestedAnalysis).sort().map(razon => (
            <Accordion key={razon} type="single" collapsible className="w-full bg-white dark:bg-slate-900 shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <AccordionItem value={razon} className="border-0">
                <AccordionTrigger className="p-4 text-xl font-bold text-indigo-700 dark:text-indigo-400 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {razon}
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-4">
                    {Object.keys(nestedAnalysis[razon]).sort().map(subrazon => (
                      <div key={subrazon} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">{subrazon}</h4>
                        <Table>
                          <TableHeader className="bg-slate-100 dark:bg-slate-700">
                            <TableRow>
                              <TableHead className="p-2">Diagnóstico y Solución</TableHead>
                              <TableHead className="p-2 text-right">Cantidad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nestedAnalysis[razon][subrazon].map((item: any, i: number) => {
                              const [diagnostico, solucion] = item.key.split(' | ')
                              return (
                                <TableRow key={i}>
                                  <TableCell className="p-2">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{diagnostico}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{solucion}</p>
                                  </TableCell>
                                  <TableCell className="p-2 text-right font-mono font-semibold">{item.count}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  )
}
