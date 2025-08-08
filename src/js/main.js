// src/js/main.js
import Papa from 'papaparse';
import {initializeTabs } from './ui.js';
import { processGeneralAnalysis, processWeeklyAnalysis } from './analysis.js';
import { displayGeneralResults, displayWeeklyResults, renderAllCharts } from './dom-updates.js';

// --- Estado Global de la Aplicación ---
let processedDataStore = null;
let lastGeneralAnalysis = null;
let lastWeeklyAnalysis = null; 
let lastMonthName = '';
let lastYear = 0;

/**
 * Aplica el tema (claro/oscuro) a la página y guarda la preferencia.
 * @param {boolean} isDark - True si se debe aplicar el modo oscuro.
 */
function applyTheme(isDark) {
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    document.documentElement.classList.toggle('dark', isDark);
    if (lightIcon) lightIcon.classList.toggle('hidden', !isDark);
    if (darkIcon) darkIcon.classList.toggle('hidden', isDark);
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');

    if (lastGeneralAnalysis) {
        displayGeneralResults(lastGeneralAnalysis, lastMonthName, lastYear);
        renderAllCharts(lastGeneralAnalysis);
    }
    if (lastWeeklyAnalysis) { // <-- NUEVO
        displayWeeklyResults(lastWeeklyAnalysis);
    }
}

/**
 * Inicializa el modo oscuro basándose en las preferencias del sistema o del usuario.
 */
export function initializeTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const isDarkMode = localStorage.getItem('color-theme') === 'dark' || 
                       (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(isDarkMode);

    themeToggleBtn.addEventListener('click', () => {
        applyTheme(!document.documentElement.classList.contains('dark'));
    });
}

// --- Inicialización de la Interfaz ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeTabs();
    initializeSelectors();
    setupEventListeners();
});

function initializeSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    if(!monthSelect) return;
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthSelect.innerHTML = months.map((month, i) => `<option value="${i}">${month}</option>`).join('');
    const now = new Date();
    monthSelect.value = now.getMonth().toString();
    document.getElementById('yearInput').value = now.getFullYear().toString();
}

function setupEventListeners() {
    // Listener para el Análisis General
    const processBtn = document.getElementById('processBtn');
    processBtn.addEventListener('click', () => {
        const csvFileInput = document.getElementById('csvFile');
        const monthSelect = document.getElementById('monthSelect');
        const yearInput = document.getElementById('yearInput');
        const file = csvFileInput.files[0];
        if (!file) { alert("Por favor, selecciona un archivo CSV."); return; }
        
        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";
        
        Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete: (results) => {
                processedDataStore = results.data;
                const selectedMonth = parseInt(monthSelect.value, 10);
                const selectedYear = parseInt(yearInput.value, 10);
                
                // Guardamos el análisis y los parámetros para poder re-renderizar
                lastGeneralAnalysis = processGeneralAnalysis(processedDataStore, selectedMonth, selectedYear);
                lastMonthName = monthSelect.options[selectedMonth].text;
                lastYear = selectedYear;
                
                // Mostramos los resultados por primera vez
                displayGeneralResults(lastGeneralAnalysis, lastMonthName, lastYear);
                renderAllCharts(lastGeneralAnalysis);
                
                processBtn.disabled = false;
                processBtn.textContent = "Analizar Período";
                const weeklyBtn = document.getElementById('processBtnWeek');
                if (weeklyBtn) weeklyBtn.disabled = false;
            }
        });
    });

    // Listener para el Análisis Semanal
    const processBtnWeek = document.getElementById('processBtnWeek');
    processBtnWeek.disabled = true; // Empieza deshabilitado
    processBtnWeek.addEventListener('click', () => {
        if (!processedDataStore) {
            alert("Primero debes procesar un archivo en la pestaña 'Análisis General'.");
            return;
        }
        lastWeeklyAnalysis = processWeeklyAnalysis(processedDataStore);
        displayWeeklyResults(lastWeeklyAnalysis);
    });
}