import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { AlertCircle, ArrowUpRight, Share2, History, Layers, ExternalLink } from "lucide-react"

interface EscalationAnalysisViewProps {
  analysis: {
    escalatedCasesList: any[];
    bandejaCounts: Record<string, number>;
  }
}

export function EscalationAnalysisView({ analysis }: EscalationAnalysisViewProps) {
  if (!analysis || !analysis.escalatedCasesList || analysis.escalatedCasesList.length === 0) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full"><Share2 className="w-8 h-8 text-muted-foreground opacity-20" /></div>
        <div>
          <h3 className="text-lg font-bold text-foreground">No hay registros de escalamientos</h3>
          <p className="text-sm text-muted-foreground max-w-xs">No se detectaron casos con tickets hijos o derivaciones en este set de datos.</p>
        </div>
      </div>
    )
  }

  const escalatedCount = analysis.escalatedCasesList.length

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card md:col-span-2 p-6 flex items-center justify-between bg-gradient-to-br from-brand-amber/5 to-transparent">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2"><AlertCircle className="w-6 h-6 text-brand-amber" />Análisis de Escalamientos</h2>
            <p className="text-sm text-muted-foreground">Casos derivados a bandejas de segundo nivel o soporte especializado</p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-black text-brand-amber tabular-nums">{escalatedCount}</div>
             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tickets Escalados</div>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Bandejas de Destino</p>
          <div className="space-y-2 max-h-[100px] overflow-auto custom-scrollbar">
            {Object.entries(analysis.bandejaCounts).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground truncate pr-2">{name}</span>
                <span className="font-bold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="bento-card overflow-hidden">
        <CardHeader className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-brand-indigo" /><CardTitle className="text-sm font-bold text-foreground uppercase">Registro de Casos Vinculados</CardTitle></div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto custom-scrollbar max-h-[600px]">
          <Table>
            <TableHeader className="bg-transparent sticky top-0 z-10 bg-white dark:bg-zinc-900 shadow-sm">
              <TableRow className="border-b border-border">
                <TableHead className="text-[10px] uppercase font-bold pl-6">Caso Padre</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-center">Ticket Hijo</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">Bandeja Destino</TableHead>
                <th className="pr-6"></th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.escalatedCasesList.map((c: any, index: number) => (
                <TableRow key={index} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors border-b border-border/40 group">
                  <TableCell className="py-4 pl-6">
                     <div className="text-xs font-mono font-bold text-foreground/70" dangerouslySetInnerHTML={{ __html: c.parentCase }} />
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-amber/10 text-brand-amber text-[10px] font-black border border-brand-amber/20">
                      <ExternalLink className="w-3 h-3" />
                      <div dangerouslySetInnerHTML={{ __html: c.childCase }} />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/40"></div>
                      <span className="text-xs font-semibold text-foreground/90">{c.destinationBandeja}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity cursor-default">Detalles <ArrowUpRight className="w-3 h-3" /></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
