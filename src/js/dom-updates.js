// src/js/dom-updates.js
import Papa from 'papaparse'; // PapaParse se usa aquí solo para la descarga

/**
 * Muestra los resultados del análisis general en la página.
 * @param {Object} analysis - Los datos analizados.
 * @param {string} title - Título para la sección de resultados.
 */
export function displayGeneralResults(analysis, title, selectedYear) {
    const { filteredCases, closedCases, overallAgentActivity, overallClosureStats, agentPerformance } = analysis;
    const resultsDiv = document.getElementById('results');
    
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
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Resumen General de ${title} de ${selectedYear}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${filteredCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Totales</div></div>
                        <div class="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow"><div class="text-3xl font-bold text-green-600 dark:text-green-400">${closedCases.length}</div><div class="text-sm text-slate-500 dark:text-slate-400">Casos Cerrados</div></div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Tiempos de Resolución (General)</h3>
                        <table class="w-full text-sm"><tbody>${Object.entries(overallClosureStats).map(([bucket, count]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="py-1.5 pr-2 text-slate-600 dark:text-slate-400">${bucket}</td><td class="py-1.5 font-mono text-right text-slate-800 dark:text-slate-300">${closedCases.length > 0 ? ((count / closedCases.length) * 100).toFixed(1) : 0}%</td><td class="py-1.5 pl-2 font-mono text-slate-500 dark:text-slate-400 text-right">(${count})</td></tr>`).join('')}</tbody></table>
                    </div>
                </div>
                <div class="mt-6">
                    <h3 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Actividad General por Agente</h3>
                    <table class="w-full md:w-1/2 text-sm text-left"><thead class="bg-slate-200 dark:bg-slate-700"><tr class="text-slate-600 dark:text-slate-300"><th class="p-2 font-semibold">Agente</th><th class="p-2 font-semibold">Creados</th><th class="p-2 font-semibold">Cerrados</th></tr></thead><tbody>${Object.entries(overallAgentActivity).map(([agent, data]) => `<tr class="border-b border-slate-200 dark:border-slate-700"><td class="p-2 font-medium text-slate-800 dark:text-slate-300">${agent}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.created}</td><td class="p-2 font-mono text-slate-800 dark:text-slate-300">${data.closed}</td></tr>`).join('')}</tbody></table>
                </div>
            </div>
            <div>
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-8 mb-4">Rendimiento Detallado por Agente</h2>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    ${Object.entries(agentPerformance).filter(([,data])=>data.totalClosed > 0).map(([agent, data]) => `<div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4"><h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-400">${agent}</h3><p class="text-sm text-slate-500 dark:text-slate-400 -mt-2">Total de casos cerrados: <strong>${data.totalClosed}</strong></p><div><h4 class="font-semibold text-slate-600 dark:text-slate-300 mb-2">Rendimiento General del Agente</h4><table class="w-full text-sm"><tbody>${Object.entries(data.overall).map(([bucket, count]) => `<tr class="border-b border-slate-100 dark:border-slate-700"><td class="py-1.5 pr-2 text-slate-600 dark:text-slate-400">${bucket}</td><td class="py-1.5 font-mono text-right text-slate-800 dark:text-slate-300">${((count/data.totalClosed)*100).toFixed(1)}%</td><td class="py-1.5 pl-2 font-mono text-slate-500 dark:text-slate-400 text-right">(${count})</td></tr>`).join('')}</tbody></table></div>${Object.keys(data.byReason).length > 0 ? `<div><h4 class="font-semibold text-slate-600 dark:text-slate-300 mt-4 mb-2">Desglose por Razón</h4><div class="space-y-3 max-h-60 overflow-y-auto pr-2">${Object.entries(data.byReason).map(([reason, reasonData]) => `<div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600"><p class="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">${reason} <span class="font-normal text-slate-500 dark:text-slate-400">(${reasonData.total} cerrados)</span></p><table class="w-full text-xs mt-1"><tbody>${Object.entries(reasonData.stats).filter(([,c])=>c>0).map(([bucket, count]) => `<tr><td class="py-0.5 pr-2 text-slate-500 dark:text-slate-400">${bucket}</td><td class="py-0.5 font-mono text-right text-slate-800 dark:text-slate-300">${((count/reasonData.total)*100).toFixed(0)}%</td></tr>`).join('')}</tbody></table></div>`).join('')}</div></div>` : ''}</div>`).join('') || `<p class="lg:col-span-3 text-center text-slate-500 dark:text-slate-400">Ningún agente de la lista cerró casos en este período.</p>`}
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
            a.download = `casos_${monthName}_${selectedYear}_procesados.csv`;
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
    const startDateString = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' });
        if (totalClaims === 0) {
            resultsDivWeek.innerHTML = `<p class="text-center text-slate-600 dark:text-slate-400">No se encontraron reclamos desde el ${startDateString}.</p>`;
            return;
        }
        resultsDivWeek.innerHTML = `
            <div class="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">${totalClaims} Reclamos desde el ${startDateString}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${Object.entries(claimsByReason).map(([reason, cases]) => `<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"><h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-2">${reason} <span class="text-sm font-normal text-slate-500 dark:text-slate-400">(${cases.length})</span></h3><ul class="text-sm space-y-1 max-h-48 overflow-y-auto pr-2">${cases.map(c => `<li class="text-slate-700 dark:text-slate-300"><strong>Case #${c['Nro de Case']}:</strong> ${c['Subrazón'] || 'Sin subrazón'}</li>`).join('')}</ul></div>`).join('')}
                </div>
            </div>`;
        
}