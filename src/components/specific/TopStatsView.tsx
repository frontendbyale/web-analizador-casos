import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Users, AlertTriangle, UserCircle, Briefcase, TrendingUp, Search, Filter } from "lucide-react"

interface TopStatsViewProps {
  analysis: {
    allSegments: string[];
    topClientsBySegment: Record<string, any[]>;
    topDiagnosticos: any[];
  }
}

export function TopStatsView({ analysis }: TopStatsViewProps) {
  const [selectedSegment, setSelectedSegment] = React.useState<string>("all")

  if (!analysis || !analysis.topDiagnosticos) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full"><TrendingUp className="w-8 h-8 text-muted-foreground opacity-20" /></div>
        <p className="text-sm text-muted-foreground max-w-xs">Sube la data para generar los rankings.</p>
      </div>
    )
  }

  // Filtrar los segmentos si hay uno seleccionado
  const filteredSegments = selectedSegment === "all" 
    ? Object.entries(analysis.topClientsBySegment)
    : Object.entries(analysis.topClientsBySegment).filter(([segment]) => segment === selectedSegment)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* HEADER & SEGMENT FILTER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Rankings de Operación
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis de Clientes por Segmento y Diagnósticos frecuentes
          </p>
        </div>

        <div className="w-full md:w-[250px] space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <Filter className="w-3 h-3" /> Filtrar por Segmento
           </label>
           <Select value={selectedSegment} onValueChange={setSelectedSegment}>
             <SelectTrigger className="bg-card border-border h-10">
               <SelectValue placeholder="Todos los segmentos" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Ver todos los segmentos</SelectItem>
               {analysis.allSegments.map(segment => (
                 <SelectItem key={segment} value={segment}>{segment}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: DIAGNÓSTICOS (Estatal) */}
        <Card className="bento-card flex flex-col h-[550px] overflow-hidden">
          <CardHeader className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-brand-amber/10 text-brand-amber"><Search className="w-4 h-4" /></div>
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Top 5 Diagnósticos Críticos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
            <div className="p-4 space-y-6">
              {analysis.topDiagnosticos.map((d, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground uppercase tracking-tighter">#{d.rank} {d.diagnosis}</span>
                    <span className="metric-pill bg-brand-amber/10 text-brand-amber">{d.count} Casos</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-amber h-full" style={{ width: `${(d.count / analysis.topDiagnosticos[0].count) * 100}%` }}></div>
                  </div>
                  <div className="pl-4 border-l border-border/60">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Solución habitual:</p>
                    <p className="text-[11px] text-foreground/70 italic leading-snug">{d.solutions[0]?.[0] || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: CLIENTES (Filtrada) */}
        <Card className="bento-card flex flex-col h-[550px] overflow-hidden transition-all duration-300">
          <CardHeader className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-brand-indigo/10 text-brand-indigo"><UserCircle className="w-4 h-4" /></div>
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Top Clientes por Volumen</CardTitle>
            </div>
            {selectedSegment !== 'all' && (
              <span className="text-[10px] font-bold bg-brand-indigo/10 text-brand-indigo px-2 py-0.5 rounded uppercase">Filtrado</span>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar">
            {filteredSegments.length > 0 ? (
              filteredSegments.map(([segment, clients]: [string, any[]]) => (
                <div key={segment} className="border-b border-border/40 last:border-0 animate-in fade-in duration-300">
                  <div className="bg-slate-50/50 dark:bg-zinc-900/30 px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex justify-between">
                    <span>Segmento: {segment}</span>
                    <span>{clients.length} Clientes</span>
                  </div>
                  <Table>
                    <TableBody>
                      {clients.map((c) => (
                        <TableRow key={c.client} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 border-0 transition-colors">
                          <TableCell className="py-3 font-medium text-xs pl-6 text-foreground/80">{c.client}</TableCell>
                          <TableCell className="py-3 text-right font-bold tabular-nums pr-6 text-foreground">{c.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                No hay datos para este segmento.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
