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
        
        // Ejecutar TODOS los procesos analíticos
        setAnalysisResults({
          general: analyzeGeneralCases(filtered, selected),
          weekly: processWeeklyAnalysis(cleaned),
          topStats: processTopStats(filtered),
          escalation: processEscalationAnalysis(filtered),
          yearly: processYearlyAnalysis(cleaned),
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
          const data = results.data
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

  // Sincronizar análisis general cuando cambian los agentes seleccionados
  // sin destruir los resultados de las otras pestañas
  React.useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      setAnalysisResults(prev => ({
        ...prev,
        general: analyzeGeneralCases(filteredData, selectedAgents)
      }))
    }
  }, [selectedAgents])

  return {
    allAgents,
    selectedAgents,
    setSelectedAgents,
    analysisResults,
    isLoading,
    processCasesFile,
    processContactCenterFile
  }
}
