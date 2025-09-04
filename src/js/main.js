// src/js/main.js
import Papa from 'papaparse';
import { initializeTabs } from './ui.js';
import { processContactCenterAnalysis  ,prepareData, getAgentsFromData, processGeneralAnalysis, processWeeklyAnalysis, processTopStats, processEscalationAnalysis, processYearlyAnalysis } from './analysis.js';
import { displayContactCenterResults, renderAgentFilter, displayGeneralResults, renderAllCharts, displayWeeklyResults, displayTopStats, displayEscalationResults, displayYearlyResults, renderYearlyCharts } from './dom-updates.js';

let allCleanDataStore = null;
let filteredByPeriodDataStore = null;
let allAgents = [];
let selectedAgents = [];
let lastMonthName = '';
let lastYear = 0;
let lastGeneralAnalysis = null;
let lastWeeklyAnalysis = null;
let lastEscalationAnalysis = null;
let lastYearlyAnalysis = null;

/**
 * Aplica el tema (claro/oscuro) y actualiza los gráficos.
 */
function applyTheme(isDark) {
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    
    document.documentElement.classList.toggle('dark', isDark);
    
    // Mostramos el icono correcto
    if (lightIcon) lightIcon.classList.toggle('hidden', !isDark);
    if (darkIcon) darkIcon.classList.toggle('hidden', isDark);
    
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');

    // Redibuja los gráficos si ya existen
    if (lastGeneralAnalysis) renderAllCharts(lastGeneralAnalysis);
    if (lastWeeklyAnalysis) displayWeeklyResults(lastWeeklyAnalysis);
    if (lastEscalationAnalysis) displayEscalationResults(lastEscalationAnalysis);
    if (lastYearlyAnalysis) renderYearlyCharts(lastYearlyAnalysis);
}

function runAndDisplayGeneralAnalysis() {
    if (!filteredByPeriodDataStore) return;
    lastGeneralAnalysis = processGeneralAnalysis(filteredByPeriodDataStore, selectedAgents);
    displayGeneralResults(lastGeneralAnalysis, lastMonthName, lastYear);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeSelectors();
    const themeToggleBtn = document.getElementById('theme-toggle');
    const isDarkMode = localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => applyTheme(!document.documentElement.classList.contains('dark')));
    }
    setupEventListeners();
});

function initializeSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) return;
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthSelect.innerHTML = months.map((month, i) => `<option value="${i}">${month}</option>`).join('');
    const now = new Date();
    monthSelect.value = now.getMonth().toString();
    document.getElementById('yearInput').value = now.getFullYear().toString();
}

function setupEventListeners() {
    const processBtn = document.getElementById('processBtn');
    const csvFileInput = document.getElementById('csvFile');
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearInput');

    const enableAnalysisButton = () => {
        processBtn.disabled = false;
        processBtn.textContent = "Analizar Período";
        document.getElementById('agent-filter-container').innerHTML = '';
        document.getElementById('general-analysis-content').innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400">A la espera de análisis...</p>`;
    };

    csvFileInput.addEventListener('change', enableAnalysisButton);
    monthSelect.addEventListener('change', enableAnalysisButton);
    yearInput.addEventListener('change', enableAnalysisButton);

    processBtn.addEventListener('click', () => {
        const file = csvFileInput.files[0];
        if (!file) { alert("Por favor, selecciona un archivo CSV."); return; }
        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                allCleanDataStore = prepareData(results.data);
                const selectedMonth = parseInt(monthSelect.value, 10);
                const selectedYear = parseInt(yearInput.value, 10);
                filteredByPeriodDataStore = allCleanDataStore.filter(c => {
                    const createDate = c['Fecha de Creacion'];
                    return createDate.getFullYear() === selectedYear && createDate.getMonth() === selectedMonth;
                });
                if (filteredByPeriodDataStore.length === 0) {
                    document.getElementById('general-analysis-content').innerHTML = `<div class="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-700 dark:text-amber-300 p-4 rounded-md" role="alert"><p class="font-bold">Sin Datos</p><p>No se encontraron casos para <strong>${monthSelect.options[selectedMonth].text} de ${selectedYear}</strong>.</p></div>`;
                    processBtn.disabled = false;
                    processBtn.textContent = "Analizar Período";
                    return;
                }
                allAgents = getAgentsFromData(allCleanDataStore);

                const closingAgentsSet = new Set();
                const serviceAccount = "service-account-abe26a47";
                
                filteredByPeriodDataStore.forEach(c => {
                    const closer = c['Empleado Cierre'];
                    if (c['Estado Case'] === 'Closed' && closer && closer !== serviceAccount) {
                        closingAgentsSet.add(closer);
                    }
                });
                selectedAgents = Array.from(closingAgentsSet).sort();
                lastMonthName = monthSelect.options[selectedMonth].text;
                lastYear = selectedYear;
                renderAgentFilter(allAgents, selectedAgents);
                runAndDisplayGeneralAnalysis();
                renderAllCharts(lastGeneralAnalysis);
                const agentCheckboxes = document.getElementById('agent-checkboxes');
                if (agentCheckboxes) {
                    agentCheckboxes.addEventListener('change', () => {
                        selectedAgents = Array.from(document.querySelectorAll('.agent-filter-checkbox:checked')).map(cb => cb.value);
                        runAndDisplayGeneralAnalysis();
                        renderAllCharts(lastGeneralAnalysis);
                    });
                }
                
                processBtn.textContent = "Análisis Cargado";
                const weeklyBtn = document.getElementById('processBtnWeek');
                const topStatsBtn = document.getElementById('processBtnTopStats');
                const escaladosBtn = document.getElementById('processBtnEscalados');
                const anualBtn = document.getElementById('processBtnAnual');
                if (weeklyBtn) weeklyBtn.disabled = false;
                if (topStatsBtn) topStatsBtn.disabled = false;
                if (escaladosBtn) escaladosBtn.disabled = false;
                if (anualBtn) anualBtn.disabled = false;
            }
        });
    });

    document.getElementById('processBtnWeek')?.addEventListener('click', () => {
        if (!allCleanDataStore) return;
        lastWeeklyAnalysis = processWeeklyAnalysis(allCleanDataStore);
        displayWeeklyResults(lastWeeklyAnalysis);
    });
    document.getElementById('processBtnTopStats')?.addEventListener('click', () => {
        if (!filteredByPeriodDataStore) return;
        const analysis = processTopStats(filteredByPeriodDataStore);
        displayTopStats(analysis);
    });
    document.getElementById('processBtnEscalados')?.addEventListener('click', () => {
        if (!filteredByPeriodDataStore) return;
        lastEscalationAnalysis = processEscalationAnalysis(filteredByPeriodDataStore);
        displayEscalationResults(lastEscalationAnalysis);
    });
    document.getElementById('processBtnAnual')?.addEventListener('click', () => {
        if (!allCleanDataStore) return;
        lastYearlyAnalysis = processYearlyAnalysis(allCleanDataStore);
        displayYearlyResults(lastYearlyAnalysis);
    });

    const processBtnContact = document.getElementById('processBtnContact');
    const tsvFileInputContact = document.getElementById('tsvFileContact');

    if(processBtnContact) {
        processBtnContact.addEventListener('click', () => {
            const file = tsvFileInputContact.files[0];
            if (!file) {
                alert("Por favor, selecciona un archivo TSV de sesiones.");
                return;
            }
            processBtnContact.disabled = true;
            processBtnContact.textContent = "Procesando...";

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: "\t", // <-- Indicamos que es un TSV
                complete: (results) => {
                    try {
                        // Saltamos la segunda fila que contiene descripciones
                        const data = results.data.slice(1);
                        const analysis = processContactCenterAnalysis(data);
                        displayContactCenterResults(analysis);
                    } catch (error) {
                        console.error("Error en análisis de Contact Center:", error);
                    } finally {
                        processBtnContact.disabled = false;
                        processBtnContact.textContent = "Analizar Sesiones";
                    }
                }
            });
        });
    }
}