import * as React from "react"
import { Pie, Bar } from "react-chartjs-2"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Loader2, Phone, MessageSquare, Clock, ShieldCheck, TrendingUp } from "lucide-react"
import { ChartBox } from "../shared/ChartBox"

interface ContactCenterViewProps {
  analysis: any
  onProcessFile: (file: File) => void
  isLoading: boolean
}

export function ContactCenterView({ analysis, onProcessFile, isLoading }: ContactCenterViewProps) {
  const [file, setFile] = React.useState<File | null>(null)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const chartFontColor = isDarkMode ? "#cbd5e1" : "#475569"

  if (!analysis) {
    return (
      <Card className="bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Phone className="h-12 w-12 text-slate-400" />
          <h3 className="text-xl font-bold">Análisis de Contact Center</h3>
          <p className="text-slate-500 text-center max-w-md">
            Cargue el archivo TSV de sesiones para ver el análisis de rendimiento de los agentes y KPIs generales.
          </p>
          <div className="flex flex-col w-full max-w-sm space-y-2">
            <Label htmlFor="tsvFileContact">Archivo TSV de Sesiones</Label>
            <Input 
              id="tsvFileContact" 
              type="file" 
              accept=".tsv,.txt" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <Button 
              onClick={() => file && onProcessFile(file)} 
              disabled={isLoading || !file}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 mt-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Analizar Sesiones"}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const { general, agentPerformance } = analysis;

  const metrics = [
    { label: 'Total de Chats', value: general.totalChats, icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Atendidos', value: general.totalChatsAnswered, icon: MessageSquare, color: 'text-green-600 dark:text-green-400' },
    { label: 'Transferidos', value: general.totalTransfers, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Service Level (60s)', value: `${general.serviceLevel.toFixed(1)}%`, icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Dentro de SL', value: general.slMet, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Fuera de SL', value: general.slNotMet, icon: ShieldCheck, color: 'text-rose-600 dark:text-rose-400' },
    { label: 'ASQ (Espera cola)', value: formatTime(general.asq), icon: Clock, color: 'text-slate-600 dark:text-slate-300' },
    { label: 'ASA (Espera 1er msj)', value: formatTime(general.asa), icon: Clock, color: 'text-slate-600 dark:text-slate-300' },
    { label: 'AHT (T.M.O.)', value: formatTime(general.aht), icon: Clock, color: 'text-slate-600 dark:text-slate-300' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <ChartBox title="Volumen Total de Chats" height="h-[320px]" className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <Pie 
            data={{
              labels: ['Atendidos', 'Transferidos'],
              datasets: [{
                data: [general.totalChatsAnswered, general.totalTransfers],
                backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(217, 119, 6, 0.7)'],
                borderColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderWidth: 2
              }]
            }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: chartFontColor } } }
            }} 
          />
        </ChartBox>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <Card key={metric.label} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
              <metric.icon className="h-5 w-5 mb-2 opacity-50" />
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">{metric.label}</h3>
              <p className={`text-2xl lg:text-3xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Rendimiento Detallado por Agente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agentPerformance.map((agent: any) => (
            <Card key={agent.agent} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 truncate">{agent.agent}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{agent.cola}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-500">Atendidos</div>
                  <div className="font-bold text-lg">{agent.answeredChats}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-500">Service Level</div>
                  <div className="font-bold text-lg">{agent.serviceLevel}</div>
                </div>
              </div>
              <ChartBox title="Tiempos Promedio (seg)" height="h-[180px]" className="border-0 p-0 shadow-none bg-transparent">
                <Bar 
                  data={{
                    labels: ['ASQ', 'ASA', 'AHT'],
                    datasets: [{
                      label: 'Segundos',
                      data: [agent.asq, agent.asa, agent.aht],
                      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(30, 64, 175, 0.7)', 'rgba(5, 150, 105, 0.7)'],
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: chartFontColor } },
                      y: { ticks: { color: chartFontColor }, beginAtZero: true }
                    }
                  }}
                />
              </ChartBox>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
