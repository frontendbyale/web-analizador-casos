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
import { Loader2, FileText, BarChart3, TrendingUp, Calendar, LayoutDashboard, Phone, ChevronDown, ChevronUp } from "lucide-react"

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
    }
  }

  const toggleAgent = (agent: string) => {
    setSelectedAgents(prev => 
      prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-200">
              Analizador de Casos
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6 pb-20">
        {/* Controls Panel */}
        <Card className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg font-bold">Carga de Datos y Filtros</CardTitle>
            </div>
            {showFilters ? <ChevronUp className="h-5 w-5 opacity-50" /> : <ChevronDown className="h-5 w-5 opacity-50" />}
          </CardHeader>
          {showFilters && (
            <CardContent className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2.5">
                  <Label htmlFor="csvFile" className="text-xs font-bold uppercase tracking-wider text-slate-500">Archivo CSV de Casos</Label>
                  <Input 
                    id="csvFile" 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mes de Análisis</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, i) => (
                        <SelectItem key={i} value={i.toString()}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="yearInput" className="text-xs font-bold uppercase tracking-wider text-slate-500">Año</Label>
                  <Input 
                    id="yearInput" 
                    type="number" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)} 
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <Button 
                  onClick={handleProcessFile} 
                  disabled={isLoading || !file}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 shadow-lg shadow-indigo-600/20 w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                  {isLoading ? "Procesando..." : "Analizar Período"}
                </Button>
              </div>

              {allAgents.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Filtrar por Agentes que Cerraron Casos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {allAgents.map(agent => (
                      <label key={agent} className="flex items-center space-x-2.5 text-sm cursor-pointer group bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200">
                        <Checkbox 
                          checked={selectedAgents.includes(agent)}
                          onCheckedChange={() => toggleAgent(agent)}
                          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {agent}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Navigation Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1.5 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
            <TabsTrigger value="general" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="reclamos" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Reclamos</span>
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Top Stats</span>
            </TabsTrigger>
            <TabsTrigger value="escalados" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Escalados</span>
            </TabsTrigger>
            <TabsTrigger value="anual" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <Calendar className="h-4 w-4" /> <span className="hidden sm:inline">Anual</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all">
              <Phone className="h-4 w-4" /> <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
            <TabsContent value="general">
              {analysisResults.general ? (
                <GeneralAnalysisDashboard 
                  analysis={analysisResults.general} 
                  monthName={months[parseInt(selectedMonth)]} 
                  year={parseInt(selectedYear)} 
                />
              ) : (
                <EmptyState icon={BarChart3} message="Cargue un archivo CSV para ver el análisis general." />
              )}
            </TabsContent>
            
            <TabsContent value="reclamos">
              {analysisResults.weekly ? (
                <WeeklyAnalysisView analysis={analysisResults.weekly} />
              ) : (
                <EmptyState icon={TrendingUp} message="Haga clic en 'Analizar Período' para cargar los datos semanales." />
              )}
            </TabsContent>

            <TabsContent value="top">
              {analysisResults.topStats ? (
                <TopStatsView analysis={analysisResults.topStats} />
              ) : (
                <EmptyState icon={FileText} message="Haga clic en 'Analizar Período' para cargar los rankings." />
              )}
            </TabsContent>

            <TabsContent value="escalados">
              {analysisResults.escalation ? (
                <EscalationAnalysisView analysis={analysisResults.escalation} />
              ) : (
                <EmptyState icon={TrendingUp} message="Haga clic en 'Analizar Período' para ver los escalados." />
              )}
            </TabsContent>

            <TabsContent value="anual">
              {analysisResults.yearly ? (
                <YearlyAnalysisView analysis={analysisResults.yearly} />
              ) : (
                <EmptyState icon={Calendar} message="Haga clic en 'Analizar Período' para ver el análisis anual." />
              )}
            </TabsContent>

            <TabsContent value="contact">
              <ContactCenterView 
                analysis={analysisResults.contactCenter} 
                onProcessFile={processContactCenterFile} 
                isLoading={isLoading} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20 py-20">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-full">
          <Icon className="h-10 w-10 text-slate-400 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs">{message}</p>
      </div>
    </Card>
  )
}
