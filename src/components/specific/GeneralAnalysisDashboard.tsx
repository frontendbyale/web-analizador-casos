import * as React from "react"
import { Pie, Bar } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Button } from "../ui/button"
import Papa from "papaparse"
import { Download, Activity, CheckCircle2, AlertCircle, Globe, Users, Clock, Briefcase, BarChart3 } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

import type { TGeneralAnalysis } from "../../domain/types"

interface GeneralAnalysisViewProps {
  analysis: TGeneralAnalysis
  monthName: string
  year: number
}

export function GeneralAnalysisDashboard({ analysis, monthName, year }: GeneralAnalysisViewProps) {
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  
  if (!analysis || !analysis.filteredCases) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full">
          <Activity className="w-8 h-8 text-muted-foreground opacity-20" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Sin datos de análisis</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Carga el reporte de casos para visualizar las métricas generales.</p>
        </div>
      </div>
    )
  }

  // Bento Enterprise Palette for Charts
  const colors = {
    indigo: isDarkMode ? '#818cf8' : '#4f46e5',
    emerald: isDarkMode ? '#34d399' : '#10b981',
    amber: isDarkMode ? '#fbbf24' : '#f59e0b',
    sky: isDarkMode ? '#38bdf8' : '#0ea5e9',
    slate: isDarkMode ? '#94a3b8' : '#64748b',
  }

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
      data: Object.values(analysis.overallClosureStats),
      backgroundColor: [colors.indigo, colors.emerald, colors.amber, colors.sky],
      borderColor: isDarkMode ? '#09090b' : '#ffffff',
      borderWidth: 2,
      hoverOffset: 4
    }]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Resumen de Actividad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard gerencial de Trouble Tickets para {monthName} {year}
          </p>
        </div>
        <Button 
          onClick={downloadProcessedCsv}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Data
        </Button>
      </div>

      {/* THE 3-SECOND RULE: BENTO HERO METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-muted-foreground">Volumen Total</p>
            <div className="p-2 bg-brand-indigo/10 rounded-lg text-brand-indigo">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold tabular-nums text-foreground">
            {analysis.filteredCases.length}
          </h3>
        </div>

        {/* Cerrados Card */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-muted-foreground">Casos Resueltos</p>
            <div className="p-2 bg-brand-emerald/10 rounded-lg text-brand-emerald">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tabular-nums text-foreground">
              {analysis.closedCases.length}
            </h3>
            <span className="text-xs font-semibold text-brand-emerald">
              {((analysis.closedCases.length / analysis.filteredCases.length) * 100).toFixed(1)}% del total
            </span>
          </div>
        </div>

        {/* Abiertos Card */}
        <div className="bento-card p-5 flex flex-col justify-between border-l-4 border-l-brand-amber">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-muted-foreground">Casos Pendientes</p>
            <div className="p-2 bg-brand-amber/10 rounded-lg text-brand-amber">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold tabular-nums text-foreground">
            {analysis.openCases.length}
          </h3>
        </div>

        {/* Web Card */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-semibold text-muted-foreground">Origen Web</p>
            <div className="p-2 bg-brand-sky/10 rounded-lg text-brand-sky">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold tabular-nums text-foreground">
              {analysis.webCreatedCasesCount}
            </h3>
            <div className="flex flex-col text-right gap-1">
              <span className="text-[10px] font-semibold text-brand-emerald bg-brand-emerald/10 px-1.5 rounded">
                {analysis.webCreatedDetails.closed} resueltos
              </span>
              <span className="text-[10px] font-semibold text-brand-amber bg-brand-amber/10 px-1.5 rounded">
                {analysis.webCreatedDetails.open} abiertos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ENTERPRISE DATA: NIVEL 1 (Tiempos y SLA General) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Distribución Gráfica (1/3) */}
        <div className="bento-card p-5 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-indigo" />
            SLA Tiempos de Cierre
          </h3>
          <div className="flex-1 min-h-[220px] relative">
            <Pie 
              data={closureChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    labels: { color: isDarkMode ? '#cbd5e1' : '#475569', usePointStyle: true, boxWidth: 8, font: { size: 11 } }
                  } 
                },
              }} 
            />
          </div>
        </div>

        {/* Tabla SLA por Modelo (2/3) */}
        <div className="bento-card lg:col-span-2 flex flex-col h-[320px]">
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-indigo" />
              Rendimiento SLA por Modelo Comercial
            </h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-muted-foreground uppercase bg-slate-50 dark:bg-zinc-900/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Modelo</th>
                  <th className="px-4 py-3 font-semibold text-center">&lt; 24hs (Éxito)</th>
                  <th className="px-4 py-3 font-semibold text-center">24-48hs (Aceptable)</th>
                  <th className="px-4 py-3 font-semibold text-right">Volumen Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {Object.entries(analysis.resolutionByModel).map(([model, stats]) => {
                  const total = Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0) as number
                  const ratio24 = total > 0 ? (stats['Menos de 24hs'] / total) * 100 : 0
                  const ratio48 = total > 0 ? (stats['Entre 24hs y 48hs'] / total) * 100 : 0
                  
                  return (
                    <tr key={model} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{model}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold tabular-nums text-brand-emerald">{ratio24.toFixed(1)}%</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground ml-1">({stats['Menos de 24hs']})</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold tabular-nums text-brand-amber">{ratio48.toFixed(1)}%</span>
                        <span className="text-[10px] tabular-nums text-muted-foreground ml-1">({stats['Entre 24hs y 48hs']})</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">{total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ENTERPRISE DATA: NIVEL 2 (Actividad Global de Agentes) */}
      <div className="bento-card flex flex-col h-[350px]">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-indigo" />
            Actividad Consolidada por Agente
          </h3>
          <span className="text-xs text-muted-foreground">Incluye casos propios y asignaciones web</span>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground uppercase sticky top-0 z-10 bg-card border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Agente Asignado</th>
                <th className="px-4 py-3 font-semibold text-center">Casos Creados</th>
                <th className="px-4 py-3 font-semibold text-center">Casos Resueltos</th>
                <th className="px-4 py-3 font-semibold text-right">Efectividad de Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Object.entries(analysis.overallAgentActivity).map(([agent, data]) => {
                const eff = data.created > 0 ? (data.closed / data.created) * 100 : 0
                return (
                  <tr key={agent} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{agent}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="metric-pill bg-slate-100 dark:bg-zinc-800 text-foreground tabular-nums">{data.created}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="metric-pill bg-brand-emerald/10 text-brand-emerald tabular-nums">{data.closed}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold tabular-nums ${eff >= 100 ? 'text-brand-emerald' : eff >= 50 ? 'text-brand-amber' : 'text-brand-rose'}`}>
                        {eff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENTERPRISE DATA: NIVEL 3 (Desglose Individual) */}
      <div className="pt-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-indigo" />
          Auditoría de Rendimiento Individual
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(analysis.agentPerformance)
            .filter(([, data]) => data.totalClosed > 0)
            .map(([agent, data]) => (
              <div key={agent} className="bento-card flex flex-col shadow-sm hover:shadow-md transition-shadow">
                
                {/* Agent Header */}
                <div className="p-4 border-b border-border/50 bg-slate-50/80 dark:bg-zinc-900/50 flex justify-between items-center rounded-t-xl">
                  <h3 className="text-sm font-bold text-foreground truncate pr-2">{agent}</h3>
                  <span className="text-xs font-bold metric-pill bg-brand-emerald/15 text-brand-emerald whitespace-nowrap">
                    {data.totalClosed} Resueltos
                  </span>
                </div>
                
                <div className="p-4 flex-1 flex flex-col space-y-5">
                  
                  {/* Minigráfico de Status */}
                  <div className="h-[100px] w-full">
                    <Bar
                      data={{
                        labels: Object.keys(data.overall),
                        datasets: [{
                          data: Object.values(data.overall),
                          backgroundColor: [colors.indigo, colors.emerald, colors.amber, colors.sky],
                          borderRadius: 2,
                          barThickness: 12
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: isDarkMode ? '#94a3b8' : '#64748b' } },
                          y: { display: false, beginAtZero: true }
                        }
                      }}
                    />
                  </div>

                  {/* Asignación Web vs Propios */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-brand-sky/5 p-3 rounded-lg border border-brand-sky/10">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-brand-sky" /> Web Asignado
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-foreground">Pendiente</span>
                        <span className="font-bold tabular-nums text-brand-amber">{analysis.webCreatedDetails.perAgent[agent]?.assigned || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-foreground">Cerrado</span>
                        <span className="font-bold tabular-nums text-brand-emerald">{analysis.webCreatedDetails.perAgent[agent]?.closed || 0}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" /> Propios
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-foreground">Pendiente</span>
                        <span className="font-bold tabular-nums text-brand-amber">{analysis.agentCreatedDetails[agent]?.open || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-foreground">Cerrado</span>
                        <span className="font-bold tabular-nums text-brand-emerald">{analysis.agentCreatedDetails[agent]?.closed || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desglose de Razones */}
                  <div>
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-border/50 pb-1">
                      Razones de Cierre Frecuentes
                    </h4>
                    <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {Object.entries(data.byReason).map(([reason, reasonData]: [string, any]) => (
                        <div key={reason} className="p-2.5 bg-slate-50 dark:bg-zinc-900/30 rounded border border-border/50">
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                            <h5 className="font-semibold text-xs text-foreground leading-tight flex-1">{reason}</h5>
                            <span className="text-[10px] font-bold metric-pill bg-brand-indigo/10 text-brand-indigo self-start">
                              {reasonData.total}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground uppercase mb-2">{reasonData.model}</p>
                          
                          <div className="space-y-1">
                            {Object.entries(reasonData.stats).map(([bucket, count]: [string, any]) => (
                              count > 0 && (
                                <div key={bucket} className="flex justify-between items-center text-[10px]">
                                  <span className="text-muted-foreground">{bucket}</span>
                                  <span className="font-bold text-foreground tabular-nums">
                                    {((count / reasonData.total) * 100).toFixed(0)}% <span className="text-muted-foreground font-normal ml-0.5">({count})</span>
                                  </span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  )
}
