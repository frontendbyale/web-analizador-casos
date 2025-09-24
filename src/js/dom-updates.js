// src/js/dom-updates.js
import papa from 'papaparse'
// --- Instancias para los Gráficos ---
// Guardamos una referencia a cada gráfico para poder actualizarlos o destruirlos.
let closureChartInstance = null;
let weeklyChartInstance = null;
let escalationChartInstance = null;
let agentChartInstances = {};
let yearlyChartInstance = null;
let monthlyChartInstances = [];
let contactVolumeChartInstance = null;
let contactAgentChartInstances = {};


// =================================================================
// FUNCIONES DE RENDERIZADO DE GRÁFICOS
// =================================================================

/**
 * Renderiza el gráfico de torta de tiempos de cierre general.
 */
function renderClosureChart(overallClosureStats, totalClosed) {
    const ctx = document.getElementById('closureTimeChart');
    if (!ctx) return;
    if (closureChartInstance) closureChartInstance.destroy();

    const labels = Object.keys(overallClosureStats);
    const data = Object.values(overallClosureStats);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';

    closureChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# de Casos',
                data: data,
                backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'],
                borderColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: chartFontColor, font: { size: 12 } } },
                title: { display: true, text: 'Distribución de Tiempos de Cierre', color: chartFontColor, font: { size: 16, weight: 'bold' } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            const percentage = totalClosed > 0 ? ((value / totalClosed) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} casos (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza un gráfico de barras horizontal para el rendimiento de un agente.
 */
function renderAgentPerformanceChart(agent, agentOverallStats) {
    const canvasId = `agent-chart-${agent}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (agentChartInstances[agent]) agentChartInstances[agent].destroy();

    const labels = Object.keys(agentOverallStats);
    const data = Object.values(agentOverallStats);
    const totalCases = data.reduce((a, b) => a + b, 0);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const backgroundColors = ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'];

    agentChartInstances[agent] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Casos',
                data: data,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            indexAxis: 'x',
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
                    ticks: { color: chartFontColor, callback: function(value) { if (Number.isInteger(value)) return value; } },
                    grid: { color: gridColor }
                },
                y: { ticks: { color: chartFontColor }, grid: { color: 'transparent' } }
            }
        }
    });
}

/**
 * Renderiza el gráfico de barras para el análisis semanal por razón.
 */
function renderWeeklyChart(claimsByReason) {
    const ctx = document.getElementById('weeklyAnalysisChart');
    if (!ctx) return;
    if (weeklyChartInstance) weeklyChartInstance.destroy();

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
                backgroundColor: 'rgba(129, 140, 248, 0.7)',
                borderColor: 'rgba(129, 140, 248, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Reclamos por Razón en la Última Semana', color: chartFontColor, font: { size: 16, weight: 'bold' } }
            },
            scales: {
                x: { ticks: { color: chartFontColor }, grid: { color: gridColor } },
                y: { ticks: { color: chartFontColor }, grid: { color: 'transparent' } }
            }
        }
    });
}

/**
 * Renderiza el gráfico de torta para la distribución de bandejas de escalado.
 */
function renderEscalationChart(bandejaCounts) {
    const ctx = document.getElementById('escalationChart');
    if (!ctx) return;
    if (escalationChartInstance) escalationChartInstance.destroy();

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
 * Renderiza el gráfico de líneas múltiples para el análisis anual.
 */
function renderYearlyLineChart(analysis) {
    const ctx = document.getElementById('yearlyLineChart');
    if (!ctx) return;
    if (yearlyChartInstance) yearlyChartInstance.destroy();
    
    const { monthlyData, year } = analysis;
    const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const categoryColors = {
        'Menos de 24hs': 'rgba(79, 70, 229, 1)', 'Entre 24hs y 48hs': 'rgba(5, 150, 105, 1)',
        'Entre 48hs y 72hs': 'rgba(217, 119, 6, 1)', 'Más de 72hs': 'rgba(220, 38, 38, 1)'
    };
    const datasets = Object.keys(monthlyData).map(category => ({
        label: category, data: monthlyData[category], borderColor: categoryColors[category],
        backgroundColor: categoryColors[category].replace('1)', '0.2)'),
        fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: categoryColors[category],
    }));

    yearlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { color: chartFontColor } },
                title: { display: true, text: `Evolución de Tiempos de Cierre - ${year}`, color: chartFontColor, font: { size: 18 } }
            },
            scales: {
                x: { ticks: { color: chartFontColor }, grid: { color: gridColor } },
                y: { ticks: { color: chartFontColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        }
    });
}

/**
 * Renderiza un gráfico de barras individual para un mes específico.
 */
function renderMonthlyBarChart(monthIndex, dataForMonth) {
    const canvasId = `monthly-bar-chart-${monthIndex}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (monthlyChartInstances[monthIndex]) monthlyChartInstances[monthIndex].destroy();
    
    const labels = Object.keys(dataForMonth);
    const data = Object.values(dataForMonth);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const backgroundColors = ['rgba(79, 70, 229, 0.7)', 'rgba(5, 150, 105, 0.7)', 'rgba(217, 119, 6, 0.7)', 'rgba(220, 38, 38, 0.7)'];

    monthlyChartInstances[monthIndex] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Casos',
                data: data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => `Casos: ${context.raw || 0}` } }
            },
            scales: {
                x: { ticks: { color: chartFontColor, font: { size: 10 } }, grid: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: chartFontColor, callback: function(value) { if (Number.isInteger(value)) return value; } }, grid: { color: gridColor } }
            }
        }
    });
}


// =================================================================
// FUNCIONES ORQUESTADORAS DE GRÁFICOS
// =================================================================

/**
 * Dibuja o redibuja todos los gráficos del análisis general.
 */
export function renderAllCharts(analysis) {
    if (!analysis) return;
    const { closedCases, overallClosureStats, agentPerformance } = analysis;
    if (closedCases.length > 0) renderClosureChart(overallClosureStats, closedCases.length);
    Object.entries(agentPerformance).forEach(([agent, data]) => {
        if (data.totalClosed > 0) renderAgentPerformanceChart(agent, data.overall);
    });
}

/**
 * Dibuja o redibuja todos los gráficos de la sección ANUAL.
 */
export function renderYearlyCharts(analysis) {
    if (!analysis) return;
    renderYearlyLineChart(analysis);
    const { monthlyData } = analysis;
    const activeMonths = [];
    for (let i = 0; i < 12; i++) {
        const totalForMonth = Object.values(monthlyData).reduce((sum, categoryData) => sum + categoryData[i], 0);
        if (totalForMonth > 0) activeMonths.push(i);
    }
    activeMonths.forEach(monthIndex => {
        const dataForMonth = {
            ' < 24hs': monthlyData['Menos de 24hs'][monthIndex], '24-48hs': monthlyData['Entre 24hs y 48hs'][monthIndex],
            '48-72hs': monthlyData['Entre 48hs y 72hs'][monthIndex], '> 72hs': monthlyData['Más de 72hs'][monthIndex]
        };
        renderMonthlyBarChart(monthIndex, dataForMonth);
    });
}

/**
 * --- NUEVA FUNCIÓN ---
 * Renderiza el gráfico de torta para el volumen de chats del Contact Center.
 * @param {Object} analysis - Los datos del análisis.
 */
function renderContactVolumeChart(analysis) {
    const ctx = document.getElementById('contactVolumeChart');
    if (!ctx) return;

    if (contactVolumeChartInstance) {
        contactVolumeChartInstance.destroy();
    }

    const labels = ['Atendidos', 'Transferidos'];
    const data = [analysis.totalChatsAnswered, analysis.totalTransfers];
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';

    contactVolumeChartInstance = new Chart(ctx, {
        type: 'pie', // Gráfico de torta (estilo dona)
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)',  // Atendidos -> Indigo
                    'rgba(217, 119, 6, 0.7)'   // Transferidos -> Amber
                ],
                borderColor: isDarkMode ? '#1e293b' : '#ffffff',
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
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Volumen Total de Chats',
                    color: chartFontColor,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * --- NUEVA FUNCIÓN ---
 * Renderiza un gráfico de barras individual para un agente del Contact Center.
 * @param {Object} agentData - Los datos de rendimiento del agente.
 */
function renderContactAgentChart(agentData) {
    const canvasId = `contact-agent-chart-${agentData.agent.replace(/\s+/g, '-')}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (contactAgentChartInstances[agentData.agent]) {
        contactAgentChartInstances[agentData.agent].destroy();
    }
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartFontColor = isDarkMode ? '#cbd5e1' : '#475569';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    contactAgentChartInstances[agentData.agent] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['ASQ', 'ASA', 'AHT'],
            datasets: [{
                label: 'Segundos',
                data: [agentData.asq, agentData.asa, agentData.aht],
                backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(30, 64, 175, 0.7)', 'rgba(5, 150, 105, 0.7)'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Tiempos Promedio (en segundos)', color: chartFontColor, font: { size: 12 } }
            },
            scales: {
                x: { ticks: { color: chartFontColor }, grid: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: chartFontColor }, grid: { color: gridColor } }
            }
        }
    });
}



// =================================================================
// FUNCIONES PRINCIPALES DE VISUALIZACIÓN
// =================================================================

/**
 * Renderiza el panel de filtro con checkboxes para los agentes.
 */
export function renderAgentFilter(allAgents, selectedAgents) {
    const filterContainer = document.getElementById('agent-filter-container');
    if (!filterContainer) return;
    filterContainer.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Filtrar por Agente</h3>
            <div id="agent-checkboxes" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                ${allAgents.map(agent => `
                    <label class="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" value="${agent}" class="agent-filter-checkbox h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" ${selectedAgents.includes(agent) ? 'checked' : ''}>
                        <span>${agent}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Muestra la ESTRUCTURA HTML del análisis general (sin dibujar los gráficos).
 */
export function displayGeneralResults(analysis, monthName, year) {
    const {overallClosureStats, filteredCases, closedCases, openCases, openCasesAssignedTo, webCreatedCasesCount, webCasesClosedByAgent, overallAgentActivity, agentPerformance, resolutionByModel } = analysis;
    const contentDiv = document.getElementById('general-analysis-content');
    if (!contentDiv) return;

    const finalCsvData = filteredCases.map(c => ({
        'Modelo Comercial': c['Modelo Comercial'],
        'Segmento Comercial': c['Segmento Comercial'],
        'Cliente': c['Cliente'],
        'Nro de Case': c['Nro de Case'],
        'Estado de Case': c['Estado Case'],
        'Agente Asignado': c['Usuario Asignado'] || 'No asignado',
        'Razon': c['Razón'],
        'Subrazon': c['Subrazón'],
        'Fecha de Creacion': c['Fecha de Creacion'] ? c['Fecha de Creacion'].toISOString().slice(0, 19).replace('T', ' ') : '',
        'Fecha de Cierre': c['Fecha de Cierre'] ? c['Fecha de Cierre'].toISOString().slice(0, 19).replace('T', ' ') : '',
        'Diagnostico': c['Diagnóstico'],
        'Solucion': c['Solución']
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

    contentDiv.innerHTML = `
        <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Resumen General de ${monthName} de ${year}</h2>
            <div class="relative h-64 md:h-80 mb-1">
                <canvas id="closureTimeChart"></canvas>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${filteredCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Totales</div></div>
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-green-600 dark:text-green-400">${closedCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Cerrados</div></div>
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-amber-600 dark:text-amber-400">${openCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Abiertos</div></div>
                <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-sky-600 dark:text-sky-400">${webCreatedCasesCount}</div><div class="text-sm text-slate-500 dark:text-slate-400">Creados por Web</div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Tiempos de Resolución (General)</h3>
                    <table class="w-full text-sm"><tbody>${Object.entries(overallClosureStats).map(([bucket, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 pr-2 text-slate-600 dark:text-slate-400">${bucket}</td><td class="py-1.5 font-mono text-right text-slate-800 dark:text-slate-300">${closedCases.length > 0 ? ((count / closedCases.length) * 100).toFixed(1) : 0}%</td><td class="py-1.5 pl-2 font-mono text-slate-500 dark:text-slate-400 text-right">(${count})</td></tr>`).join('')}</tbody></table>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2 mt-4">Tiempos de Resolución por Modelo Comercial</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-slate-200 dark:bg-slate-700">
                                <tr class="text-slate-600 dark:text-slate-300">
                                    <th class="p-3 font-semibold">Modelo Comercial</th>
                                    <th class="p-3 font-semibold text-center">&lt; 24hs</th>
                                    <th class="p-3 font-semibold text-center">24-48hs</th>
                                    <th class="p-3 font-semibold text-center">48-72hs</th>
                                    <th class="p-3 font-semibold text-center">&gt; 72hs</th>
                                    <th class="p-3 font-semibold text-center">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${Object.entries(resolutionByModel).map(([model, stats]) => {
                                const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
                                const formatCell = (count) => {
                                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                    return `${percentage}% <span class="text-xs text-slate-500 dark:text-slate-400">(${count})</span>`;
                                };
                                return `
                                    <tr class="border-b border-slate-200 dark:border-slate-700">
                                        <td class="p-3 font-medium text-slate-800 dark:text-slate-300">${model}</td>
                                        <td class="p-3 font-mono text-center text-slate-800 dark:text-slate-300">${formatCell(stats['Menos de 24hs'])}</td>
                                        <td class="p-3 font-mono text-center text-slate-800 dark:text-slate-300">${formatCell(stats['Entre 24hs y 48hs'])}</td>
                                        <td class="p-3 font-mono text-center text-slate-800 dark:text-slate-300">${formatCell(stats['Entre 48hs y 72hs'])}</td>
                                        <td class="p-3 font-mono text-center text-slate-800 dark:text-slate-300">${formatCell(stats['Más de 72hs'])}</td>
                                        <td class="p-3 font-mono text-center font-bold text-slate-800 dark:text-slate-300">${total}</td>
                                    </tr>
                                `;
                            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Actividad General por Agente</h3>
                    <table class="w-full text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Creados</th><th class="p-2 font-semibold">Cerrados</th></tr></thead><tbody>${Object.entries(overallAgentActivity).map(([agent, data]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.created}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.closed}</td></tr>`).join('')}</tbody></table>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2 mt-6">Casos Abiertos Asignados</h3>
                    <table class="w-full text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Cantidad Asignada</th></tr></thead><tbody>${Object.entries(openCasesAssignedTo).map(([agent, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${count}</td></tr>`).join('')}</tbody></table>
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2 mt-6">Cierres de Casos Web por Agente</h3>
                    <table class="w-full text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Cantidad Cerrada</th></tr></thead><tbody>${Object.entries(webCasesClosedByAgent).map(([agent, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${count}</td></tr>`).join('')}</tbody></table>
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
            const csvString = papa.unparse(finalCsvData);
            // ... lógica de descarga ...
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `casos_${monthName}_procesados.csv`;
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
    const { allSegments, topClientsBySegment, topDiagnosticos } = analysis;
    const resultsDiv = document.getElementById('resultsTopStats');
    if (!resultsDiv) return;

    // --- LÓGICA PARA RENDERIZAR LA TABLA DE CLIENTES (SIN CAMBIOS) ---
    const renderTopClientsTable = (segment) => {
        const tableContainer = document.getElementById('topClientsTableContainer');
        if (!tableContainer) return;
        
        const clientsData = topClientsBySegment[segment] || [];
        
        if (clientsData.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-slate-500 dark:text-slate-400">No hay datos para este segmento.</p>`;
            return;
        }

        tableContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300">
                        <th class="p-3 font-semibold">#</th>
                        <th class="p-3 font-semibold">Cliente</th>
                        <th class="p-3 font-semibold">Casos</th>
                    </tr></thead>
                    <tbody>
                    ${clientsData.map(c => `
                        <tr class="border-b border-slate-200 dark:border-slate-700">
                            <td class="p-3 align-top font-bold text-slate-500 dark:text-slate-400">${c.rank}</td>
                            <td class="p-3 align-top">
                                <p class="font-medium text-slate-800 dark:text-slate-300">${c.client}</p>
                            </td>
                            <td class="p-3 align-top">
                                <div class="flex flex-wrap gap-2 items-center dark:text-white">
                                    <span class="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mr-2">(${c.count})</span>
                                    ${c.cases.join(' ')}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    // --- ESTRUCTURA HTML PRINCIPAL (RESTAURADA Y CORREGIDA) ---
    resultsDiv.innerHTML = `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <div class="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200">Top 10 Clientes por Segmento</h2>
                    <select id="segmentSelector" class="w-full sm:w-auto p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200">
                        ${allSegments.map(segment => `<option value="${segment}">${segment}</option>`).join('')}
                    </select>
                </div>
                <div id="topClientsTableContainer"></div>
            </div>

            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Top 5 Diagnósticos Frecuentes</h2>
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
                                    <span class="flex-1 pr-2">- ${solution}</span>
                                    <span class="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-300">${count}</span>
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

    // --- INICIALIZACIÓN Y EVENT LISTENER ---
    if (allSegments.length > 0) {
        renderTopClientsTable(allSegments[0]);
    }
    
    const segmentSelector = document.getElementById('segmentSelector');
    if (segmentSelector) {
        segmentSelector.addEventListener('change', (e) => {
            renderTopClientsTable(e.target.value);
        });
    }
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

/**
 * Muestra los resultados del análisis anual.
 */
export function displayYearlyResults(analysis) {
    const resultsDiv = document.getElementById('resultsAnual');
    if (!resultsDiv) return;

    const { monthlyData } = analysis;
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Dic"];
    let monthlyChartsHTML = '';
    let hasMonthlyData = false;

    for (let i = 0; i < 12; i++) {
        const totalForMonth = Object.values(monthlyData).reduce((sum, categoryData) => sum + categoryData[i], 0);
        if (totalForMonth > 0) {
            hasMonthlyData = true;
            monthlyChartsHTML += `
                <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 class="text-lg font-bold text-center text-slate-700 dark:text-slate-200 mb-2">
                        ${monthNames[i]} (Total: ${totalForMonth})
                    </h3>
                    <div class="relative h-64"><canvas id="monthly-bar-chart-${i}"></canvas></div>
                </div>
            `;
        }
    }
    
    if (!hasMonthlyData) {
        resultsDiv.innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400">No se encontraron casos cerrados en el año actual para mostrar.</p>`;
        return;
    }

    resultsDiv.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div class="relative h-[500px]">
                <canvas id="yearlyLineChart"></canvas>
            </div>
        </div>

        <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-12 mb-4">Desglose Mensual</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            ${monthlyChartsHTML}
        </div>
    `;
    renderYearlyCharts(analysis)
}


/**
 * --- FUNCIÓN DEFINITIVA ---
 * Muestra el dashboard completo del Contact Center: KPIs, gráfico de volumen y desglose por agente.
 */
export function displayContactCenterResults(analysis) {
    const resultsDiv = document.getElementById('resultsContact');
    if (!resultsDiv) return;

    const { general, agentPerformance } = analysis;
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const metrics = [
        { label: 'Total de Chats', value: general.totalChats },
        { label: 'Atendidos', value: general.totalChatsAnswered },
        { label: 'Transferidos', value: general.totalTransfers },
        { label: 'Service Level (60s)', value: `${general.serviceLevel.toFixed(1)}%` },
        { label: 'ASQ (Espera cola)', value: formatTime(general.asq) },
        { label: 'ASA (Espera 1er msj)', value: formatTime(general.asa) },
        { label: 'AHT (T.M.O.)', value: formatTime(general.aht) },
    ];

    resultsDiv.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div class="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div class="relative h-80">
                    <canvas id="contactVolumeChart"></canvas>
                </div>
            </div>
            <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                ${metrics.map(metric => `
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                        <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-300">${metric.label}</h3>
                        <p class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">${metric.value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-8 mb-4">Rendimiento Detallado por Agente</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                ${agentPerformance.map(agent => `
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
                        <div>
                            <h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-400 truncate">${agent.agent}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400">${agent.cola}</p>
                        </div>
                        <div class="relative h-48">
                            <canvas id="contact-agent-chart-${agent.agent.replace(/\s+/g, '-')}"></canvas>
                        </div>
                        <table class="w-full text-sm">
                            <tbody>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">Atendidos</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${agent.answeredChats}</td></tr>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">Transferidos</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${agent.transfers}</td></tr>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">Nivel de Servicio</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${agent.serviceLevel.toFixed(1)}%</td></tr>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">ASQ</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${formatTime(agent.asq)}</td></tr>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">ASA</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${formatTime(agent.asa)}</td></tr>
                                <tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 font-medium text-slate-600 dark:text-slate-400">AHT</td><td class="py-1.5 font-mono text-right font-semibold text-slate-800 dark:text-slate-200">${formatTime(agent.aht)}</td></tr>
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Renderizamos todos los gráficos
    renderContactVolumeChart(general);
    agentPerformance.forEach(agent => {
        renderContactAgentChart(agent);
    });
}