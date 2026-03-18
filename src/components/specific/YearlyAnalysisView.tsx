import * as React from "react"
import { Line, Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from "chart.js"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { ChartBox } from "../shared/ChartBox"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface YearlyAnalysisViewProps {
  analysis: any
}

export function YearlyAnalysisView({ analysis }: YearlyAnalysisViewProps) {
  if (!analysis) return null

  const { monthlyData, year } = analysis
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const chartFontColor = isDarkMode ? "#cbd5e1" : "#475569"
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
  
  const categoryColors = {
    'Menos de 24hs': 'rgba(79, 70, 229, 1)', 'Entre 24hs y 48hs': 'rgba(5, 150, 105, 1)',
    'Entre 48hs y 72hs': 'rgba(217, 119, 6, 1)', 'Más de 72hs': 'rgba(220, 38, 38, 1)'
  }

  const yearlyChartData = {
    labels: labels,
    datasets: Object.keys(monthlyData).map(category => ({
      label: category, 
      data: monthlyData[category], 
      borderColor: categoryColors[category as keyof typeof categoryColors],
      backgroundColor: categoryColors[category as keyof typeof categoryColors].replace('1)', '0.2)'),
      fill: false, 
      tension: 0.3, 
      pointRadius: 4, 
      pointBackgroundColor: categoryColors[category as keyof typeof categoryColors],
    }))
  }

  const activeMonths: number[] = []
  for (let i = 0; i < 12; i++) {
    const totalForMonth = Object.values(monthlyData).reduce((sum: any, categoryData: any) => sum + categoryData[i], 0)
    if (totalForMonth > 0) activeMonths.push(i)
  }

  return (
    <div className="space-y-12">
      <Card className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="relative h-[500px]">
          <Line 
            data={yearlyChartData} 
            options={{
              responsive: true, 
              maintainAspectRatio: false, 
              interaction: { mode: 'index' as const, intersect: false },
              plugins: {
                legend: { position: 'bottom' as const, labels: { color: chartFontColor } },
                title: { display: true, text: `Evolución de Tiempos de Cierre - ${year}`, color: chartFontColor, font: { size: 18 } }
              },
              scales: {
                x: { ticks: { color: chartFontColor }, grid: { color: gridColor } },
                y: { ticks: { color: chartFontColor }, grid: { color: gridColor }, beginAtZero: true }
              }
            }} 
          />
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Desglose Mensual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeMonths.map(monthIndex => {
            const dataForMonth = {
              ' < 24hs': monthlyData['Menos de 24hs'][monthIndex], 
              '24-48hs': monthlyData['Entre 24hs y 48hs'][monthIndex],
              '48-72hs': monthlyData['Entre 48hs y 72hs'][monthIndex], 
              '> 72hs': monthlyData['Más de 72hs'][monthIndex]
            }
            const total = Object.values(dataForMonth).reduce((a: any, b: any) => a + b, 0)
            
            return (
              <ChartBox 
                key={monthIndex} 
                title={`${labels[monthIndex]} (Total: ${total})`} 
                height="h-[250px]"
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <Bar
                  data={{
                    labels: Object.keys(dataForMonth),
                    datasets: [{
                      label: 'Casos',
                      data: Object.values(dataForMonth),
                      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'],
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: chartFontColor, font: { size: 10 } }, grid: { display: false } },
                      y: { ticks: { color: chartFontColor, precision: 0 }, grid: { color: gridColor }, beginAtZero: true }
                    }
                  }}
                />
              </ChartBox>
            )
          })}
        </div>
      </div>
    </div>
  )
}
