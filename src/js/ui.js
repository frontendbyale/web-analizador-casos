// src/js/ui.js
export function initializeTabs() {
    const tabs = [
        { button: document.getElementById('tab-analisis'), content: document.getElementById('content-analisis') },
        { button: document.getElementById('tab-reclamos'), content: document.getElementById('content-reclamos') },
        { button: document.getElementById('tab-top-stats'), content: document.getElementById('content-top-stats') },
        { button: document.getElementById('tab-escalados'), content: document.getElementById('content-escalados') },
        { button: document.getElementById('tab-anual'), content: document.getElementById('content-anual') },
        { button: document.getElementById('tab-contact'), content: document.getElementById('content-contact') }
    ];
    const activeClasses = 'text-indigo-600 dark:text-indigo-400 border-indigo-500';
    const inactiveClasses = 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-600';
    tabs.forEach(tab => {
        if (tab.button && tab.content) {
            tab.button.addEventListener('click', () => {
                tabs.forEach(t => {
                    if (t.content) t.content.classList.add('hidden');
                    if (t.button) t.button.className = t.button.className.replace(activeClasses, inactiveClasses).trim();
                });
                tab.content.classList.remove('hidden');
                tab.button.className = tab.button.className.replace(inactiveClasses, activeClasses).trim();
            });
        }
    });
}