import * as React from "react"
import Papa from "papaparse"
import { prepareData, getAgentsFromData, analyzeGeneralCases, processWeeklyAnalysis, processTopStats, processEscalationAnalysis, processYearlyAnalysis, processContactCenterAnalysis } from "../../domain/caseAnalysis"

export function useCaseData() {
  const [allCleanData, setAllCleanData] = React.useState<any[] | null>(null)
  const [filteredData, setFilteredData] = React.useState<any[] | null>(null)
  const [allAgents, setAllAgents] = React.useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = React.useState<string[]>([])
  
  const [analysisResults, setAnalysisResults] = React.useState<{
    general: any;
    weekly: any;
    topStats: any;
    escalation: any;
    yearly: any;
    contactCenter: any;
  }>({
    general: null,
    weekly: null,
    topStats: null,
    escalation: null,
    yearly: null,
    contactCenter: null
  })

  const [isLoading, setIsLoading] = React.useState(false)

  // Procesar archivo CSV de Casos
  const processCasesFile = React.useCallback((file: File, month: number, year: number) => {
    setIsLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = prepareData(results.data)
        setAllCleanData(cleaned)
        
        const filtered = cleaned.filter((c: any) => {
          const createDate = c['Fecha de Creacion']
          return createDate && createDate.getFullYear() === year && createDate.getMonth() === month
        })
        setFilteredData(filtered)
        
        const agents = getAgentsFromData(cleaned)
        setAllAgents(agents)
        
        // Auto-seleccionar agentes que cerraron casos en el periodo
        const closingAgents = new Set<string>()
        const serviceAccount = "service-account-abe26a47"
        filtered.forEach((c: any) => {
          const closer = c['Empleado Cierre']
          if (c['Estado Case'] === 'Closed' && closer && closer !== serviceAccount) {
            closingAgents.add(closer)
          }
        })
        const selected = Array.from(closingAgents).sort()
        setSelectedAgents(selected)
        
        // Análisis Inicial (PROCESAR TODO DE UNA VEZ)
        const general = analyzeGeneralCases(filtered, selected)
        const weekly = processWeeklyAnalysis(cleaned)
        const topStats = processTopStats(filtered)
        const escalation = processEscalationAnalysis(filtered)
        const yearly = processYearlyAnalysis(cleaned)
        
        setAnalysisResults({
          general,
          weekly,
          topStats,
          escalation,
          yearly,
          contactCenter: null
        })
        
        setIsLoading(false)
      },
      error: (err) => {
        console.error("Error al parsear CSV:", err)
        setIsLoading(false)
      }
    })
  }, [])

  // Procesar archivo TSV de Contact Center
  const processContactCenterFile = React.useCallback((file: File) => {
    setIsLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: "\t",
      complete: (results) => {
        try {
          const data = results.data.slice(1)
          const contactCenter = processContactCenterAnalysis(data)
          setAnalysisResults(prev => ({ ...prev, contactCenter }))
        } catch (error) {
          console.error("Error en análisis de Contact Center:", error)
        } finally {
          setIsLoading(false)
        }
      }
    })
  }, [])

  // Ejecutar otros análisis bajo demanda
  const runWeeklyAnalysis = React.useCallback(() => {
    if (!allCleanData) return
    const weekly = processWeeklyAnalysis(allCleanData)
    setAnalysisResults(prev => ({ ...prev, weekly }))
  }, [allCleanData])

  const runTopStats = React.useCallback(() => {
    if (!filteredData) return
    const topStats = processTopStats(filteredData)
    setAnalysisResults(prev => ({ ...prev, topStats }))
  }, [filteredData])

  const runEscalationAnalysis = React.useCallback(() => {
    if (!filteredData) return
    const escalation = processEscalationAnalysis(filteredData)
    setAnalysisResults(prev => ({ ...prev, escalation }))
  }, [filteredData])

  const runYearlyAnalysis = React.useCallback(() => {
    if (!allCleanData) return
    const yearly = processYearlyAnalysis(allCleanData)
    setAnalysisResults(prev => ({ ...prev, yearly }))
  }, [allCleanData])

  // Actualizar análisis general cuando cambian los agentes seleccionados
  React.useEffect(() => {
    if (filteredData) {
      const general = analyzeGeneralCases(filteredData, selectedAgents)
      setAnalysisResults(prev => ({ ...prev, general }))
    }
  }, [selectedAgents, filteredData])

  return {
    allAgents,
    selectedAgents,
    setSelectedAgents,
    analysisResults,
    isLoading,
    processCasesFile,
    processContactCenterFile,
    runWeeklyAnalysis,
    runTopStats,
    runEscalationAnalysis,
    runYearlyAnalysis
  }
}
