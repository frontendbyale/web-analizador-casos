import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"

interface TopStatsViewProps {
  analysis: any
}

export function TopStatsView({ analysis }: TopStatsViewProps) {
  if (!analysis) return null

  const { allSegments, topClientsBySegment, topDiagnosticos } = analysis
  const [selectedSegment, setSelectedSegment] = React.useState(allSegments[0] || "")

  const clientsData = topClientsBySegment[selectedSegment] || []

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      <Card className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Top 10 Clientes por Segmento</h2>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-full sm:w-[250px] bg-white dark:bg-slate-700">
              <SelectValue placeholder="Seleccionar segmento" />
            </SelectTrigger>
            <SelectContent>
              {allSegments.map((segment: string) => (
                <SelectItem key={segment} value={segment}>{segment}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-200 dark:bg-slate-700">
              <TableRow>
                <TableHead className="w-[50px] p-3">#</TableHead>
                <TableHead className="p-3">Cliente</TableHead>
                <TableHead className="p-3">Casos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsData.map((c: any) => (
                <TableRow key={c.rank} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <TableCell className="p-3 align-top font-bold text-slate-500 dark:text-slate-400">{c.rank}</TableCell>
                  <TableCell className="p-3 align-top font-medium text-slate-800 dark:text-slate-300">{c.client}</TableCell>
                  <TableCell className="p-3 align-top">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mr-2">({c.count})</span>
                      <div className="flex flex-wrap gap-1">
                        {c.cases.map((caseId: string, i: number) => (
                          <div key={i} dangerouslySetInnerHTML={{ __html: caseId }} className="text-sm bg-slate-100 dark:bg-slate-700 px-2 rounded-md" />
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clientsData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="p-4 text-center text-slate-500">No hay datos para este segmento.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-6">Top 5 Diagnósticos Frecuentes</h2>
        <div className="space-y-4">
          {topDiagnosticos.map((d: any) => (
            <Card key={d.rank} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-lg">#{d.rank}</span>
                <h3 className="flex-grow text-lg font-semibold text-indigo-700 dark:text-indigo-400 px-4 leading-tight">{d.diagnosis}</h3>
                <span className="font-mono text-xl font-bold text-slate-800 dark:text-slate-300 ml-2">{d.count}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Soluciones Aplicadas:</h4>
                <ul className="space-y-2 text-sm">
                  {d.solutions.map(([solution, count]: [string, number], i: number) => (
                    <li key={i} className="flex justify-between items-start text-slate-700 dark:text-slate-300">
                      <span className="flex-1 pr-4">- {solution}</span>
                      <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-300 font-bold">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
