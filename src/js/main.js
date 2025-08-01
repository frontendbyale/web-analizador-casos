// src/js/main.js
import Papa from 'papaparse';
import { initializeTheme, initializeTabs } from './ui.js';
import { processGeneralAnalysis, processWeeklyAnalysis } from './analysis.js';
import { displayGeneralResults, displayWeeklyResults } from './dom-updates.js';

// --- Estado Global de la Aplicación ---
let processedDataStore = null;

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
        const file = csvFileInput.files[0];
        if (!file) { alert("Por favor, selecciona un archivo CSV."); return; }
        
        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";
        
        Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete: (results) => {
                processedDataStore = results.data; // Guardamos los datos
                const selectedMonth = parseInt(document.getElementById('monthSelect').value, 10);
                const selectedYear = parseInt(document.getElementById('yearInput').value, 10);
                
                const analysis = processGeneralAnalysis(processedDataStore, selectedMonth, selectedYear);
                const title = `${document.getElementById('monthSelect').options[selectedMonth].text} de ${selectedYear}`;
                displayGeneralResults(analysis, title, selectedYear);
                
                processBtn.disabled = false;
                processBtn.textContent = "Analizar Período";
                document.getElementById('processBtnWeek').disabled = false;
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
        const analysis = processWeeklyAnalysis(processedDataStore);
        displayWeeklyResults(analysis);
    });
}