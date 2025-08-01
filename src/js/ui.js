// src/js/ui.js

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

/**
 * Inicializa la funcionalidad de las pestañas de navegación.
 */
export function initializeTabs() {
    const tabs = [
        { button: document.getElementById('tab-analisis'), content: document.getElementById('content-analisis') },
        { button: document.getElementById('tab-reclamos'), content: document.getElementById('content-reclamos') }
    ];
    const activeClasses = 'text-indigo-600 dark:text-indigo-400 border-indigo-500';
    const inactiveClasses = 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600';

    tabs.forEach(tab => {
        if (tab.button) {
            tab.button.addEventListener('click', () => {
                tabs.forEach(t => {
                    if (t.content) t.content.classList.add('hidden');
                    if (t.button) t.button.className = t.button.className.replace(activeClasses, inactiveClasses);
                });
                if (tab.content) tab.content.classList.remove('hidden');
                if (tab.button) tab.button.className = tab.button.className.replace(inactiveClasses, activeClasses);
            });
        }
    });
}