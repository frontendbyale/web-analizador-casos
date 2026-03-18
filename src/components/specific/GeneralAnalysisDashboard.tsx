import * as React from "react"
import { Pie, Bar } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Button } from "../ui/button"
import { ChartBox } from "../shared/ChartBox"
import Papa from "papaparse"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

import type { TGeneralAnalysis } from "../../domain/types"

interface GeneralAnalysisViewProps {
  analysis: TGeneralAnalysis
  monthName: string
  year: number
}

export function GeneralAnalysisDashboard({ analysis, monthName, year }: GeneralAnalysisViewProps) {
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const chartFontColor = isDarkMode ? "#cbd5e1" : "#475569"

  const downloadProcessedCsv = () => {
    const finalCsvData = analysis.filteredCases.map(c => ({
      'Modelo Comercial': c['Modelo Comercial'],
      'Segmento Comercial': c['Segmento Comercial'],
      'Cliente': c['Cliente'],
      'Nro de Case': c['Nro de Case'],
      'Estado de Case': c['Estado Case'],
      'Agente Asignado': c['Usuario Asignado'] || 'No asignado',
      'Agente Creacion': c['Empleado Creación'] || 'No especificado',
      'Origen': c['Empleado Creación'] === 'service-account-abe26a47' ? 'WEB' : 'AGENTE',
      'Razon': c['Razón'],
      'Subrazon': c['Subrazón'],
      'Fecha de Creacion': c['Fecha de Creacion'] ? c['Fecha de Creacion'].toISOString().slice(0, 19).replace('T', ' ') : '',
      'Fecha de Cierre': c['Fecha de Cierre'] ? c['Fecha de Cierre'].toISOString().slice(0, 19).replace('T', ' ') : '',
      'Diagnostico': c['Diagnóstico'],
      'Solucion': c['Solución']
    }))

    const csvString = Papa.unparse(finalCsvData)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `casos_${monthName}_procesados.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const closureChartData = {
    labels: Object.keys(analysis.overallClosureStats),
    datasets: [{
      label: '# de Casos',
      data: Object.values(analysis.overallClosureStats),
      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'],
      borderColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderWidth: 2
    }]
  }

  return (
    <div className="space-y-8">
      <Card className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">
          Resumen General de {monthName} de {year}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ChartBox title="Distribución de Tiempos de Cierre">
            <Pie 
              data={closureChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: chartFontColor, font: { size: 12 } } },
                }
              }} 
            />
          </ChartBox>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Casos Totales', value: analysis.filteredCases.length, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Casos Cerrados', value: analysis.closedCases.length, color: 'text-green-600 dark:text-green-400' },
              { label: 'Casos Abiertos', value: analysis.openCases.length, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Creados por Web', value: analysis.webCreatedCasesCount, color: 'text-sky-600 dark:text-sky-400' }
            ].map(stat => (
              <Card key={stat.label} className="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow flex flex-col items-center justify-center">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              Casos Creados por la Web (Resumen)
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xl font-bold text-sky-600">{analysis.webCreatedDetails.total}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Totales</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xl font-bold text-green-600">{analysis.webCreatedDetails.closed}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cerrados</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xl font-bold text-amber-600">{analysis.webCreatedDetails.open}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Abiertos</div>
              </div>
            </div>

            <Accordion type="single" collapsible className="mb-8">
              <AccordionItem value="web-assignment" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-bold uppercase text-slate-500 hover:no-underline">
                  Ver Asignación Web por Agente
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-[10px] uppercase font-bold">Agente</TableHead>
                        <TableHead className="h-8 text-center text-[10px] uppercase font-bold">Asig. Abiertos</TableHead>
                        <TableHead className="h-8 text-center text-[10px] uppercase font-bold">Cerrados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analysis.webCreatedDetails.perAgent)
                        .filter(([, stats]) => stats.assigned > 0 || stats.closed > 0)
                        .sort((a, b) => (b[1].assigned + b[1].closed) - (a[1].assigned + a[1].closed))
                        .map(([agent, stats]) => (
                        <TableRow key={agent}>
                          <TableCell className="py-2 text-xs font-medium">{agent}</TableCell>
                          <TableCell className="py-2 text-center font-mono text-xs text-amber-600 font-bold">{stats.assigned}</TableCell>
                          <TableCell className="py-2 text-center font-mono text-xs text-green-600 font-bold">{stats.closed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-4">Tiempos de Resolución por Modelo Comercial</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-200 dark:bg-slate-700">
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="text-center">&lt; 24hs</TableHead>
                    <TableHead className="text-center">24-48hs</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(analysis.resolutionByModel).map(([model, stats]) => {
                    const total = Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0) as number
                    return (
                      <TableRow key={model}>
                        <TableCell className="font-medium">{model}</TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {total > 0 ? ((stats['Menos de 24hs'] / total) * 100).toFixed(1) : 0}% 
                          <span className="text-[10px] text-muted-foreground ml-1">({stats['Menos de 24hs']})</span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {total > 0 ? ((stats['Entre 24hs y 48hs'] / total) * 100).toFixed(1) : 0}%
                          <span className="text-[10px] text-muted-foreground ml-1">({stats['Entre 24hs y 48hs']})</span>
                        </TableCell>
                        <TableCell className="text-center font-bold font-mono text-xs">{total}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-4">Actividad General por Agente</h3>
            <Table>
              <TableHeader className="bg-slate-200 dark:bg-slate-700">
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead className="text-center">Creados</TableHead>
                  <TableHead className="text-center">Cerrados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(analysis.overallAgentActivity).map(([agent, data]) => (
                  <TableRow key={agent}>
                    <TableCell className="font-medium">{agent}</TableCell>
                    <TableCell className="text-center font-mono">{data.created}</TableCell>
                    <TableCell className="text-center font-mono">{data.closed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={downloadProcessedCsv}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg flex items-center gap-2"
          >
            Descargar CSV Procesado
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Rendimiento Detallado por Agente</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(analysis.agentPerformance)
            .filter(([, data]) => data.totalClosed > 0)
            .map(([agent, data]) => (
              <Card key={agent} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <ChartBox title={agent} height="h-[200px]">
                  <Bar
                    data={{
                      labels: Object.keys(data.overall),
                      datasets: [{
                        label: 'Casos',
                        data: Object.values(data.overall),
                        backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'],
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { ticks: { precision: 0 } }
                      }
                    }}
                  />
                </ChartBox>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Total de casos cerrados: <strong>{data.totalClosed}</strong></p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-100 dark:border-sky-800">
                      <div className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold mb-1">Web asignados</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Abiertos:</span>
                        <span className="font-bold">{analysis.webCreatedDetails.perAgent[agent]?.assigned || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Cerrados:</span>
                        <span className="font-bold">{analysis.webCreatedDetails.perAgent[agent]?.closed || 0}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold mb-1">Creados por {agent.split(' ')[0]}</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Abiertos:</span>
                        <span className="font-bold">{analysis.agentCreatedDetails[agent]?.open || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Cerrados:</span>
                        <span className="font-bold">{analysis.agentCreatedDetails[agent]?.closed || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">Desglose por Razón</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                      {Object.entries(data.byReason).map(([reason, reasonData]: [string, any]) => (
                        <div key={reason} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm leading-tight">{reason}</h5>
                            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                              {reasonData.total}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">{reasonData.model}</p>
                          <Table>
                            <TableBody>
                              {Object.entries(reasonData.stats).map(([bucket, count]: [string, any]) => (
                                count > 0 && (
                                  <TableRow key={bucket} className="border-0 h-auto">
                                    <TableCell className="p-0 py-0.5 text-[11px] text-slate-500">{bucket}</TableCell>
                                    <TableCell className="p-0 py-0.5 text-right font-mono text-[11px] font-bold">
                                      {((count / reasonData.total) * 100).toFixed(0)}% ({count})
                                    </TableCell>
                                  </TableRow>
                                )
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}