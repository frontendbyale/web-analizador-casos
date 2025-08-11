// src/js/dom-updates.js
import Papa from 'papaparse'; // PapaParse se usa aquí solo para la descarga

// Variables para guardar las instancias de los gráficos y poder destruirla antes de crear una nueva
let closureChartInstance = null;
let weeklyChartInstance = null;
let agentChartInstances = {};
let escalationChartInstance = null;

/**
 * Renderiza el gráfico de torta de tiempos de cierre.
 * @param {Object} overallClosureStats - Los datos para el gráfico.
 * @param {number} totalClosed - El número total de casos cerrados.
 */
function renderClosureChart(overallClosureStats, totalClosed) {
    const ctx = document.getElementById('closureTimeChart');
    if (!ctx) return;

    // Si ya existe un gráfico, lo destruimos para evitar conflictos
    if (closureChartInstance) {
        closureChartInstance.destroy();
    }

    const labels = Object.keys(overallClosureStats);
    const data = Object.values(overallClosureStats);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569'; // slate-300 / slate-600

    closureChartInstance = new Chart(ctx, {
        type: 'pie', // 'pie' o 'doughnut' para gráfico de torta
        data: {
            labels: labels,
            datasets: [{
                label: '# de Casos',
                data: data,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)',  // Indigo
                    'rgba(5, 150, 105, 0.7)',   // Emerald
                    'rgba(217, 119, 6, 0.7)',  // Amber
                    'rgba(220, 38, 38, 0.7)'   // Red
                ],
                borderColor: isDarkMode ? '#1e293b' : '#ffffff', // slate-800 / white
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartFontColor,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Distribución de Tiempos de Cierre',
                    color: chartFontColor,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = totalClosed > 0 ? ((value / totalClosed) * 100).toFixed(1) : 0;
                            return `${label}: ${value} casos (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * --- NUEVA FUNCIÓN ---
 * Renderiza el gráfico de barras para el análisis semanal por razón.
 * @param {Object} claimsByReason - Los datos de reclamos agrupados por razón.
 */
function renderWeeklyChart(claimsByReason) {
    const ctx = document.getElementById('weeklyAnalysisChart');
    if (!ctx) return;

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    // Preparamos los datos para el gráfico
    const labels = Object.keys(claimsByReason);
    const data = labels.map(label => claimsByReason[label].length);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Reclamos',
                data: data,
                backgroundColor: 'rgba(129, 140, 248, 0.7)', // Indigo
                borderColor: 'rgba(129, 140, 248, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // <-- Gráfico de barras horizontal para mejor lectura
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // No es necesaria para un solo dataset
                },
                title: {
                    display: true,
                    text: 'Reclamos por Razón en la Última Semana',
                    color: chartFontColor,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    ticks: { color: chartFontColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: chartFontColor },
                    grid: { color: 'transparent' }
                }
            }
        }
    });
}

/**
 * --- NUEVA FUNCIÓN ---
 * Renderiza un gráfico de torta individual para el rendimiento de un agente.
 * @param {string} agent - El nombre del agente (para el ID del canvas).
 * @param {Object} agentOverallStats - Los datos de rendimiento del agente.
 */
function renderAgentPerformanceChart(agent, agentOverallStats) {
    const canvasId = `agent-chart-${agent}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error(`Canvas con id ${canvasId} no encontrado.`);
        return;
    }

    if (agentChartInstances[agent]) {
        agentChartInstances[agent].destroy();
    }

    const labels = Object.keys(agentOverallStats);
    const data = Object.values(agentOverallStats);
    const totalCases = data.reduce((a, b) => a + b, 0);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Paleta de colores consistente con el gráfico principal
    const backgroundColors = [
        'rgba(79, 70, 229, 0.7)',  // Menos de 24hs -> Indigo
        'rgba(5, 150, 105, 0.7)',   // 24-48hs -> Emerald
        'rgba(217, 119, 6, 0.7)',  // 48-72hs -> Amber
        'rgba(220, 38, 38, 0.7)'   // +72hs -> Red
    ];

    agentChartInstances[agent] = new Chart(ctx, {
        type: 'bar', // <-- Cambiado a 'bar'
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Casos',
                data: data,
                backgroundColor: backgroundColors, // <-- Colores consistentes
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'x', // <-- Eje Y como principal para barras horizontales
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(1) : 0;
                            return `Casos: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { 
                        color: chartFontColor,
                    },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: chartFontColor },
                    grid: { color: 'transparent' }
                }
            }
        }
    });
}

export function renderAllCharts(analysis) {
    if (!analysis) return;
    const { closedCases, overallClosureStats, agentPerformance } = analysis;

    // Renderizar gráfico principal
    if (closedCases.length > 0) {
        renderClosureChart(overallClosureStats, closedCases.length);
    }
    
    // Renderizar gráficos de agentes
    Object.entries(agentPerformance).forEach(([agent, data]) => {
        if (data.totalClosed > 0) {
            renderAgentPerformanceChart(agent, data.overall);
        }
    });
}

/**
 * Muestra los resultados del análisis general en la página.
 * @param {Object} analysis - Los datos analizados.
 * @param {string} title - Título para la sección de resultados.
 */
export function displayGeneralResults(analysis, lastMonthName, lastYear) {
    
    const { filteredCases, closedCases, openCases, openCasesAssignedTo, overallAgentActivity, overallClosureStats, agentPerformance } = analysis;
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    // Preparar CSV para descarga
    const finalCsvData = filteredCases.map(c => ({
        'Modelo Comercial': c['Modelo Comercial'],'Segmento Comercial': c['Segmento Comercial'],'Cliente': c['Cliente'],
        'Nro de Case': c['Nro de Case'],'Estado de Case': c['Estado Case'],'Razon': c['Razón'],'Subrazon': c['Subrazón'],
        'Fecha de Creacion': c['Fecha de Creacion'] ? c['Fecha de Creacion'].toISOString().slice(0, 19).replace('T', ' ') : '',
        'Fecha de Cierre': c['Fecha de Cierre'] ? c['Fecha de Cierre'].toISOString().slice(0, 19).replace('T', ' ') : '',
        'Diagnostico': c['Diagnóstico'],'Solucion': c['Solución']
    }));

    let downloadHTML = '';
    if (finalCsvData.length > 0) {
        downloadHTML = `<div class="mt-8">
                <button id="downloadBtn" class="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-green-700 transition-colors">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.293V3a1 1 0 112 0v8.293l1.293-1.586a1 1 0 111.414 1.414l-3 3.5a1 1 0 01-1.414 0l-3-3.5a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    Descargar CSV Procesado
                </button>
            </div>`; // El HTML del botón de descarga
    }
    
    // El resto del innerHTML para los resultados...
      resultsDiv.innerHTML = `
        <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Resumen General de ${lastMonthName} de ${lastYear}</h2>
            <div class="relative h-64 md:h-80 mb-1">
                <canvas id="closureTimeChart"></canvas>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${filteredCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Totales</div></div>
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-green-600 dark:text-green-400">${closedCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Cerrados</div></div>
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-amber-600 dark:text-amber-400">${openCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Abiertos</div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Tiempos de Resolución (General)</h3>
                    <table class="w-full text-sm"><tbody>${Object.entries(overallClosureStats).map(([bucket, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 pr-2 text-slate-600 dark:text-slate-400">${bucket}</td><td class="py-1.5 font-mono text-right text-slate-800 dark:text-slate-300">${closedCases.length > 0 ? ((count / closedCases.length) * 100).toFixed(1) : 0}%</td><td class="py-1.5 pl-2 font-mono text-slate-500 dark:text-slate-400 text-right">(${count})</td></tr>`).join('')}</tbody></table>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Actividad General por Agente</h3>
                    <table class="w-full text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Creados</th><th class="p-2 font-semibold">Cerrados</th></tr></thead><tbody>${Object.entries(overallAgentActivity).map(([agent, data]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.created}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.closed}</td></tr>`).join('')}</tbody></table>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2 mt-6">Casos Abiertos Asignados</h3>
                    <table class="w-full text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Cantidad Asignada</th></tr></thead><tbody>${Object.entries(openCasesAssignedTo).map(([agent, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${count}</td></tr>`).join('')}</tbody></table>
                </div>
            </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-8 mb-4">Rendimiento Detallado por Agente</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                ${Object.entries(agentPerformance).filter(([,data])=>data.totalClosed > 0).map(([agent, data]) => `
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
                        <div class="relative h-48 mb-3">
                            <canvas id="agent-chart-${agent}"></canvas>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">${agent}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 -mt-2">Total de casos cerrados: <strong>${data.totalClosed}</strong></p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Rendimiento General del Agente</h4>
                            <table class="w-full text-sm"><tbody>${Object.entries(data.overall).map(([bucket, count]) => `<tr class="border-b border-slate-100 dark:border-slate-700"><td class="py-1.5 pr-2 text-slate-600 dark:text-slate-400">${bucket}</td><td class="py-1.5 font-mono text-right text-slate-800 dark:text-slate-300">${((count/data.totalClosed)*100).toFixed(1)}%</td><td class="py-1.5 pl-2 font-mono text-slate-500 dark:text-slate-400 text-right">(${count})</td></tr>`).join('')}</tbody></table>
                        </div>
                        ${Object.keys(data.byReason).length > 0 ? `
                        <div>
                            <h4 class="font-semibold text-slate-600 dark:text-slate-300 mt-4 mb-2">Desglose por Razón</h4>
                            <div class="space-y-3 max-h-60 overflow-y-auto pr-2">${Object.entries(data.byReason).map(([reason, reasonData]) => `
                                <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <p class="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">${reason} <span class="font-normal text-slate-500 dark:text-slate-400">(${reasonData.total} cerrados)</span></p>
                                    <table class="w-full text-xs mt-1"><tbody>${Object.entries(reasonData.stats).filter(([,c])=>c>0).map(([bucket, count]) => `
                                        <tr><td class="py-0.5 pr-2 text-slate-500 dark:text-slate-400">${bucket}</td><td class="py-0.5 font-mono text-right text-slate-800 dark:text-slate-300">${((count/reasonData.total)*100).toFixed(0)}%</td></tr>`).join('')}
                                    </tbody></table>
                                </div>`).join('')}
                            </div>
                        </div>` : ''}
                    </div>`).join('') || `<p class="lg:col-span-3 text-center text-slate-500 dark:text-slate-400">Ningún agente de la lista cerró casos en este período.</p>`}
            </div>
        </div>
        ${downloadHTML}
    `;
    
    
  

    if (finalCsvData.length > 0) {
        document.getElementById('downloadBtn').addEventListener('click', () => {
            const csvString = Papa.unparse(finalCsvData);
            // ... lógica de descarga ...
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `casos_${title}_procesados.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
}

/**
 * Muestra los resultados del análisis semanal en la página.
 * @param {Object} analysis - El análisis semanal.
 */
export function displayWeeklyResults(analysis) {
    const { claimsByReason, totalClaims, startDate } = analysis;
    const resultsDivWeek = document.getElementById('resultsWeek');
    if (!resultsDivWeek) return;
    
    const startDateString = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' });

    if (totalClaims === 0) {
        resultsDivWeek.innerHTML = `<p class="text-center text-slate-600 dark:text-slate-400">No se encontraron reclamos desde el ${startDateString}.</p>`;
        return;
    }

    resultsDivWeek.innerHTML = `
        <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                ${totalClaims} Reclamos desde el ${startDateString}
            </h2>
            <div class="relative h-80 lg:h-96 mb-2">
                <canvas id="weeklyAnalysisChart"></canvas>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${Object.entries(claimsByReason).map(([reason, cases]) => `
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                            ${reason} <span class="text-sm font-normal text-slate-500 dark:text-slate-400">(${cases.length})</span>
                        </h3>
                        <ul class="text-sm space-y-1 max-h-48 overflow-y-auto pr-2">
                            ${cases.map(c => {
                                const creationDate = c['Fecha de Creacion'].toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                // --- CAMBIO CLAVE AQUÍ ---
                                // 3. Insertamos el HTML del caso directamente
                                return `
                                    <li class="text-slate-700 dark:text-slate-300">
                                        <span class="font-semibold text-slate-500 dark:text-slate-400">${creationDate}</span> - 
                                        <strong>Case #${c['caseHtml'] || `Case #${c['Nro de Case']}`}:</strong> ${c['Subrazón'] || 'Sin subrazón'}
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Llamamos a la nueva función para renderizar el gráfico de barras
    renderWeeklyChart(claimsByReason);
}

/**
 * Muestra los rankings de Top Clientes y Diagnósticos.
 * @param {Object} analysis - El análisis de los rankings.
 */
export function displayTopStats(analysis) {
    const { topClients, topDiagnosticos } = analysis;
    const resultsDiv = document.getElementById('resultsTopStats');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Top 10 Clientes con más Reclamos</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300">
                            <th class="p-3 font-semibold">#</th>
                            <th class="p-3 font-semibold">Cliente</th>
                            <th class="p-3 font-semibold">Casos (${'Reclamos'})</th>
                        </tr></thead>
                        <tbody>
                        ${topClients.map(c => `
                            <tr class="border-b border-slate-200 dark:border-slate-700">
                                <td class="p-3 align-top font-bold text-slate-500 dark:text-slate-400">${c.rank}</td>
                                <td class="p-3 align-top">
                                    <p class="font-medium text-slate-800 dark:text-slate-300">${c.client}</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">${c.segment}</p>
                                </td>
                                <td class="p-3 align-top">
                                    <div class="flex flex-wrap gap-2 items-center text-slate-800 dark:text-slate-300">
                                        <span class="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mr-2">(${c.count})</span>
                                        ${c.cases.join(' ')}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Top 5 Diagnósticos y sus Soluciones</h2>
                <div class="space-y-4">
                ${topDiagnosticos.map(d => `
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-slate-500 dark:text-slate-400">#${d.rank}</span>
                            <h3 class="flex-grow text-lg font-semibold text-indigo-700 dark:text-indigo-400 px-4">${d.diagnosis}</h3>
                            <span class="font-mono text-xl font-bold text-slate-800 dark:text-slate-300">${d.count}</span>
                        </div>
                        <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                            <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Soluciones Aplicadas:</h4>
                            <ul class="space-y-1 text-sm">
                            ${d.solutions.map(([solution, count]) => `
                                <li class="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                    <span>- ${solution}</span>
                                    <span class="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">${count}</span>
                                </li>
                            `).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza el gráfico de torta para la distribución de bandejas de escalado.
 */
function renderEscalationChart(bandejaCounts) {
    const ctx = document.getElementById('escalationChart');
    if (!ctx) return;

    if (escalationChartInstance) {
        escalationChartInstance.destroy();
    }

    const labels = Object.keys(bandejaCounts);
    const data = Object.values(bandejaCounts);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';

    escalationChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# de Casos',
                data: data,
                backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)', 'rgba(107, 33, 168, 0.7)'],
                borderColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: chartFontColor } },
                title: { display: true, text: 'Distribución de Escalados por Bandeja', color: chartFontColor, font: { size: 16 } }
            }
        }
    });
}


/**
 * Muestra los resultados del análisis de casos escalados.
 */
export function displayEscalationResults(analysis) {
    const { escalatedCasesList, bandejaCounts } = analysis;
    const resultsDiv = document.getElementById('resultsEscalados');
    if (!resultsDiv) return;

    if (escalatedCasesList.length === 0) {
        resultsDiv.innerHTML = `<p class="text-center text-slate-600 dark:text-slate-400">No se encontraron casos escalados en este período.</p>`;
        return;
    }

    resultsDiv.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 relative h-96">
                <canvas id="escalationChart"></canvas>
            </div>
            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Detalle de Escalados (${escalatedCasesList.length})</h2>
                <div class="max-h-96 overflow-y-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-200 dark:bg-slate-700 sticky top-0"><tr class="text-slate-600 dark:text-slate-300">
                            <th class="p-3 font-semibold">Caso Padre</th>
                            <th class="p-3 font-semibold">Caso Hijo</th>
                            <th class="p-3 font-semibold">Bandeja Destino</th>
                        </tr></thead>
                        <tbody>
                        ${escalatedCasesList.map(c => `
                            <tr class="border-b border-slate-200 dark:border-slate-700">
                                <td class="p-3 align-top text-slate-600 dark:text-slate-300">#${c.parentCase}</td>
                                <td class="p-3 align-top text-slate-600 dark:text-slate-300">#${c.childCase}</td>
                                <td class="p-3 align-top font-medium text-slate-800 dark:text-slate-300">${c.destinationBandeja}</td>
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Renderizamos el gráfico una vez que el canvas existe
    renderEscalationChart(bandejaCounts);
}