import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Calendar, AlertTriangle, MessageSquare, Hash, User, Tag, Clock } from "lucide-react"

interface WeeklyAnalysisViewProps {
  analysis: {
    claimsByReason: Record<string, any[]>;
    nestedAnalysis: any;
    totalClaims: number;
    startDate: Date;
  }
}

export function WeeklyAnalysisView({ analysis }: WeeklyAnalysisViewProps) {
  if (!analysis || !analysis.nestedAnalysis || analysis.totalClaims === 0) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full"><Calendar className="w-8 h-8 text-muted-foreground opacity-20" /></div>
        <p className="text-sm text-muted-foreground max-w-xs">Carga la data para ver el desglose de los últimos 7 días.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="bento-card p-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-brand-indigo/5 to-transparent">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2"><MessageSquare className="w-6 h-6 text-brand-indigo" />Auditoría Semanal</h2>
          <p className="text-sm text-muted-foreground">Distribución detallada de reclamos y casos identificados</p>
        </div>
        <div className="text-right">
           <div className="text-4xl font-black text-brand-indigo tabular-nums">{analysis.totalClaims}</div>
           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Casos en la Semana</div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(analysis.nestedAnalysis).map(([razon, subrazones]: [string, any], idx) => (
          <Card key={idx} className="bento-card overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={razon} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-1.5 bg-brand-indigo/10 rounded-md text-brand-indigo"><AlertTriangle className="w-4 h-4" /></div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold text-foreground">{razon}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{Object.keys(subrazones).length} variantes encontradas</p>
                    </div>
                    <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full mr-4">{analysis.claimsByReason[razon]?.length || 0} Casos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
                  
                  {/* NIVEL 1: ESTADÍSTICAS POR SUBRAZÓN */}
                  <div className="space-y-6">
                    {Object.entries(subrazones).map(([subrazon, diagnos]: [string, any], sIdx) => (
                      <div key={sIdx} className="space-y-3 pl-8 border-l-2 border-slate-100 dark:border-zinc-800">
                        <h4 className="text-xs font-bold text-foreground/80 uppercase flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/40"></div>{subrazon}</h4>
                        <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-border/40 overflow-hidden">
                          <Table>
                            <TableBody>
                              {diagnos.map((d: any, dIdx: number) => (
                                <TableRow key={dIdx} className="border-0 hover:bg-transparent">
                                  <TableCell className="text-xs text-muted-foreground py-2">{d.key}</TableCell>
                                  <TableCell className="text-right py-2 pr-4 font-bold tabular-nums"><span className="text-brand-emerald">{d.count}</span></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* NIVEL 2: CARDS DE CASOS REALES */}
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 pl-8">Detalle de Casos Vinculados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-8">
                      {analysis.claimsByReason[razon]?.map((c: any, cIdx: number) => (
                        <div key={cIdx} className="p-3 rounded-xl border border-border/60 bg-card hover:border-brand-indigo/30 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 text-brand-indigo font-mono font-bold text-xs">
                              <Hash className="w-3 h-3" /> 
                              <div className="hover:underline cursor-pointer" dangerouslySetInnerHTML={{ __html: c.caseHtml || c['Nro de Case'] }} />
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${c['Estado Case'] === 'Closed' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-amber/10 text-brand-amber'}`}>
                              {c['Estado Case']}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground/80 truncate">
                              <User className="w-3 h-3 text-muted-foreground" /> {c['Cliente'] || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" /> {c['Fecha de Creacion']?.toLocaleDateString() || '-'}
                            </div>
                            <div className="mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground italic line-clamp-1 group-hover:line-clamp-none transition-all">
                              {c['Subrazón']}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  )
}
