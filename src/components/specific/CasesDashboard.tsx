import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { useCaseData } from "../../application/hooks/useCaseData"
import { GeneralAnalysisDashboard } from "./GeneralAnalysisDashboard"
import { WeeklyAnalysisView } from "./WeeklyAnalysisView"
import { TopStatsView } from "./TopStatsView"
import { EscalationAnalysisView } from "./EscalationAnalysisView"
import { YearlyAnalysisView } from "./YearlyAnalysisView"
import { ContactCenterView } from "./ContactCenterView"
import { ThemeToggle } from "../shared/ThemeToggle"
import { 
  Loader2, FileText, BarChart3, TrendingUp, Calendar, 
  LayoutDashboard, Phone, ChevronDown, ChevronUp, UploadCloud, 
  Filter, Users, MousePointer2, AlertCircle 
} from "lucide-react"

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function CasesDashboard() {
  const { 
    allAgents, selectedAgents, setSelectedAgents, 
    analysisResults, isLoading, 
    processCasesFile, processContactCenterFile
  } = useCaseData()

  const [selectedMonth, setSelectedMonth] = React.useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString())
  const [file, setFile] = React.useState<File | null>(null)
  const [showFilters, setShowFilters] = React.useState(true)

  const handleProcessFile = () => {
    if (file) {
      processCasesFile(file, parseInt(selectedMonth), parseInt(selectedYear))
      setShowFilters(false)
    }
  }

  const toggleAgent = (agent: string) => {
    setSelectedAgents(prev => 
      prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-indigo p-2 rounded-xl shadow-lg shadow-brand-indigo/20">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">Soporte N1</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Analytics Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6"><ThemeToggle /></div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8 pb-32">
        <Card className={`bento-card overflow-hidden transition-all duration-500 ${showFilters ? 'ring-2 ring-brand-indigo/10' : ''}`}>
          <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-brand-indigo text-white' : 'bg-muted text-muted-foreground'}`}><Filter className="h-4 w-4" /></div>
              <div className="text-left">
                <CardTitle className="text-base font-bold">Consola de Control</CardTitle>
                <p className="text-xs text-muted-foreground">Configuración de período y origen de datos</p>
              </div>
            </div>
            {showFilters ? <ChevronUp className="h-5 w-5 opacity-30" /> : <ChevronDown className="h-5 w-5 opacity-30" />}
          </button>
          <div className={`grid transition-all duration-500 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <CardContent className="p-6 border-t border-border/40 space-y-8 bg-slate-50/30 dark:bg-zinc-950/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><UploadCloud className="w-3 h-3" /> Fuente de Datos (CSV)</Label>
                    <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="cursor-pointer bg-card border-border h-11 pt-2" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> Período</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="bg-card border-border h-11"><SelectValue placeholder="Mes" /></SelectTrigger>
                      <SelectContent>{months.map((month, i) => (<SelectItem key={i} value={i.toString()}>{month}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground invisible">Año</Label>
                    <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-card border-border h-11 font-bold tabular-nums" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleProcessFile} disabled={isLoading || !file} className="w-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold h-11 transition-all">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MousePointer2 className="h-4 w-4 mr-2" />}
                      {isLoading ? "Procesando..." : "Ejecutar Análisis"}
                    </Button>
                  </div>
                </div>
                {allAgents.length > 0 && (
                  <div className="pt-6 border-t border-border/40">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4"><Users className="w-3 h-3" /> Agentes Activos</Label>
                    <div className="flex flex-wrap gap-2">
                      {allAgents.map(agent => (
                        <label key={agent} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${selectedAgents.includes(agent) ? 'bg-brand-indigo/10 border-brand-indigo text-brand-indigo shadow-sm' : 'bg-card border-border text-muted-foreground hover:border-slate-300 dark:hover:border-zinc-700'}`}>
                          <Checkbox checked={selectedAgents.includes(agent)} onCheckedChange={() => toggleAgent(agent)} className="h-3.5 w-3.5 rounded border-muted-foreground/30 data-[state=checked]:bg-brand-indigo" />
                          {agent}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="general" className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="flex h-auto p-1 bg-muted/30 border border-border/50 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
              {[
                { id: 'general', icon: BarChart3, label: 'Resumen' },
                { id: 'reclamos', icon: TrendingUp, label: 'Semanas' },
                { id: 'top', icon: FileText, label: 'Rankings' },
                { id: 'escalados', icon: AlertCircle, label: 'Escalados' },
                { id: 'anual', icon: Calendar, label: 'Anual' },
                { id: 'contact', icon: Phone, label: 'Contact' },
              ].map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-brand-indigo data-[state=active]:shadow-sm">
                  <tab.icon className="h-3.5 w-3.5" /><span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <TabsContent value="general">
              {analysisResults.general ? (
                <GeneralAnalysisDashboard analysis={analysisResults.general} monthName={months[parseInt(selectedMonth)]} year={parseInt(selectedYear)} />
              ) : <EmptyDisplay message="Carga los casos para iniciar el análisis." />}
            </TabsContent>
            <TabsContent value="reclamos">
              {analysisResults.weekly ? (
                <WeeklyAnalysisView analysis={analysisResults.weekly} />
              ) : <EmptyDisplay message="Pendiente de análisis temporal." />}
            </TabsContent>
            <TabsContent value="top">
              {analysisResults.topStats ? (
                <TopStatsView analysis={analysisResults.topStats} />
              ) : <EmptyDisplay message="Pendiente de generación de rankings." />}
            </TabsContent>
            <TabsContent value="escalados">
              {analysisResults.escalation ? (
                <EscalationAnalysisView analysis={analysisResults.escalation} />
              ) : <EmptyDisplay message="Pendiente de análisis de escalamientos." />}
            </TabsContent>
            <TabsContent value="anual">
              {analysisResults.yearly ? (
                <YearlyAnalysisView analysis={analysisResults.yearly} />
              ) : <EmptyDisplay message="Pendiente de análisis histórico." />}
            </TabsContent>
            <TabsContent value="contact">
              <ContactCenterView analysis={analysisResults.contactCenter} onProcessFile={processContactCenterFile} isLoading={isLoading} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

function EmptyDisplay({ message }: { message: string }) {
  return (
    <div className="bento-card border-dashed border-2 bg-slate-50/20 dark:bg-zinc-900/10 py-32 flex flex-col items-center justify-center text-center space-y-4">
      <div className="bg-muted p-4 rounded-full"><Loader2 className="h-8 w-8 text-muted-foreground opacity-20" /></div>
      <p className="text-muted-foreground font-medium max-w-xs">{message}</p>
    </div>
  )
}
