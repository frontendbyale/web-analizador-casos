// src/js/ui.js



/**
 * Inicializa la funcionalidad de las pestañas de navegación.
 */
export function initializeTabs() {
    const tabs = [
        { button: document.getElementById('tab-analisis'), content: document.getElementById('content-analisis') },
        { button: document.getElementById('tab-reclamos'), content: document.getElementById('content-reclamos') },
        { button: document.getElementById('tab-top-stats'), content: document.getElementById('content-top-stats') }
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