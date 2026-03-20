import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Phone, UploadCloud, Loader2, Users, Clock, Hash, CheckCircle2 } from "lucide-react"

interface ContactCenterViewProps {
  analysis: any;
  onProcessFile: (file: File) => void;
  isLoading: boolean;
}

export function ContactCenterView({ analysis, onProcessFile, isLoading }: ContactCenterViewProps) {
  const [file, setFile] = React.useState<File | null>(null)

  const handleProcess = () => {
    if (file) onProcessFile(file)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* HEADER & UPLOAD */}
      <div className="bento-card p-6 flex flex-col md:flex-row items-end justify-between gap-6 bg-gradient-to-r from-brand-blue/5 to-transparent">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-brand-blue" />
            Análisis de Contact Center
          </h2>
          <p className="text-sm text-muted-foreground">Procesamiento de registros de llamadas y atención telefónica (TSV)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Archivo TSV</Label>
            <Input 
              type="file" 
              accept=".tsv,.txt" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-card h-10 pt-1.5 border-border/60"
            />
          </div>
          <Button 
            onClick={handleProcess} 
            disabled={isLoading || !file}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold h-10 self-end px-8"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            Procesar
          </Button>
        </div>
      </div>

      {!analysis ? (
        <div className="bento-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
          <div className="bg-slate-100 dark:bg-zinc-900 p-4 rounded-full text-brand-blue">
            <Phone className="w-10 h-10 opacity-20" />
          </div>
          <p className="text-muted-foreground font-medium">Carga el reporte de telefonía para ver las métricas de atención.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Total Llamadas</p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">{analysis.totalCalls}</h3>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue"><Hash className="w-4 h-4" /></div>
              </div>
            </Card>
            
            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Atendidas</p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-emerald">{analysis.answeredCalls}</h3>
                <div className="p-2 bg-brand-emerald/10 rounded-lg text-brand-emerald"><CheckCircle2 className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Tiempo Promedio</p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">{analysis.avgDuration}s</h3>
                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-muted-foreground"><Clock className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">SLA Atención</p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-blue">
                  {((analysis.answeredCalls / analysis.totalCalls) * 100).toFixed(0)}%
                </h3>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue"><Users className="w-4 h-4" /></div>
              </div>
            </Card>
          </div>

          {/* DETAILED TABLE */}
          <Card className="bento-card overflow-hidden">
            <CardHeader className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase">Desglose Detallado por Agente / Hora</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto custom-scrollbar max-h-[500px]">
              <Table>
                <TableHeader className="bg-transparent sticky top-0 z-10 bg-white dark:bg-zinc-900 shadow-sm">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-[10px] uppercase font-bold pl-6">Agente</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-center">Llamadas</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-center">Promedio Conversación</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.details.map((row: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors border-b border-border/40">
                      <TableCell className="py-3 font-semibold text-xs pl-6 text-foreground/80">{row.agent || 'Desconocido'}</TableCell>
                      <TableCell className="py-3 text-center tabular-nums font-bold">{row.count}</TableCell>
                      <TableCell className="py-3 text-center text-xs text-muted-foreground">{row.avgTime || '0:00'}</TableCell>
                      <TableCell className="py-3 text-right pr-6">
                        <span className="metric-pill bg-brand-blue/10 text-brand-blue">ACTIVO</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
