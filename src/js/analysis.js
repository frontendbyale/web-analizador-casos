const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
const agents = ['jsotelo', 'cyvarela', 'fortega'];

const getTimeBucket = (hours) => {
    if (hours <= 24) return timeBuckets[0];
    if (hours <= 48) return timeBuckets[1];
    if (hours <= 72) return timeBuckets[2];
    return timeBuckets[3];
};

const createStatObject = () => Object.fromEntries(timeBuckets.map(bucket => [bucket, 0]));

/**
 * Procesa los datos para el análisis general por período.
 * @param {Array} data - Los datos crudos del CSV.
 * @param {number} month - Mes a filtrar.
 * @param {number} year - Año a filtrar.
 * @returns {Object} - El objeto con todos los análisis.
 */
export function processGeneralAnalysis(data, month, year) {
    let processedData = data.map(row => ({ ...row,
        'Nro de Case': row['Nro. Case'] ? parseInt(row['Nro. Case'].match(/>(\d+)</)?.[1], 10) : null,
        'Fecha de Creacion': row['Fecha Creación (FFHH)'] ? new Date(row['Fecha Creación (FFHH)']) : null,
        'Fecha de Cierre': row['Fecha Cierre'] ? new Date(row['Fecha Cierre']) : null,
    })).filter(row => row['Nro de Case']);
    
    const uniqueCases = Array.from(new Map(processedData.map(item => [item['Nro de Case'], item])).values());
    const filteredCases = uniqueCases.filter(row => {
        const d = row['Fecha de Creacion'];
        return d && d.getFullYear() === year && d.getMonth() === month;
    });
    
    // --- NUEVOS CÁLCULOS AQUÍ ---
    const closedCases = filteredCases.filter(c => c['Estado Case'] === 'Closed');
    const openCases = filteredCases.filter(c => c['Estado Case'] !== 'Closed'); // 1. Casos no cerrados (abiertos)

    // 2. Conteo de casos abiertos asignados a cada agente
    const openCasesAssignedTo = Object.fromEntries(agents.map(agent => [agent, 0]));
    openCases.forEach(c => {
        const assignedUser = c['Usuario Asignado'];
        if (agents.includes(assignedUser)) {
            openCasesAssignedTo[assignedUser]++;
        }
    });

    // --- ANÁLISIS ANTERIORES (SIN CAMBIOS) ---
    const overallAgentActivity = Object.fromEntries(agents.map(agent => [agent, { created: 0, closed: 0 }]));
    filteredCases.forEach(c => {
        if (agents.includes(c['Empleado Creación'])) overallAgentActivity[c['Empleado Creación']].created++;
        if (c['Estado Case'] === 'Closed' && agents.includes(c['Empleado Cierre'])) overallAgentActivity[c['Empleado Cierre']].closed++;
    });
    const overallClosureStats = createStatObject();
    closedCases.forEach(c => {
        if(c['Fecha de Cierre'] && c['Fecha de Creacion']) {
             const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
             overallClosureStats[getTimeBucket(diffHours)]++;
        }
    });
    const agentPerformance = Object.fromEntries(agents.map(agent => [agent, { totalClosed: 0, overall: createStatObject(), byReason: {} }]));
    closedCases.forEach(c => {
        const closer = c['Empleado Cierre'];
        if (!agents.includes(closer) || !c['Fecha de Cierre'] || !c['Fecha de Creacion']) return;
        const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
        const bucket = getTimeBucket(diffHours);
        const reason = c['Razón'] || 'No Especificado';
        agentPerformance[closer].totalClosed++;
        agentPerformance[closer].overall[bucket]++;
        if (!agentPerformance[closer].byReason[reason]) {
            agentPerformance[closer].byReason[reason] = { total: 0, stats: createStatObject() };
        }
        agentPerformance[closer].byReason[reason].total++;
        agentPerformance[closer].byReason[reason].stats[bucket]++;
    });

    // Retornamos todo, incluyendo los nuevos datos
    return { 
        filteredCases, 
        closedCases, 
        openCases, // <-- Nuevo
        openCasesAssignedTo, // <-- Nuevo
        overallAgentActivity, 
        overallClosureStats, 
        agentPerformance 
    };
}

/**
 * Procesa los datos para encontrar reclamos en la última semana.
 * @param {Array} data - Los datos crudos del CSV.
 * @returns {Object} - El análisis de reclamos semanales.
 */
export function processWeeklyAnalysis(data) {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // --- CAMBIO CLAVE AQUÍ ---
    let processedData = data.map(row => ({
        ...row,
        // 1. Conservamos el HTML original en una nueva propiedad 'caseHtml'
        'caseHtml': row['Nro. Case'], 
        // 2. Extraemos el número limpio para la lógica de duplicados y filtros
        'Nro de Case': row['Nro. Case'] ? parseInt(row['Nro. Case'].match(/>(\d+)</)?.[1], 10) : null,
        'Fecha de Creacion': row['Fecha Creación (FFHH)'] ? new Date(row['Fecha Creación (FFHH)']) : null,
    })).filter(row => row['Nro de Case'] && row['Fecha de Creacion'] && row['Fecha de Creacion'] >= oneWeekAgo);
    
    // Usamos el 'Nro de Case' limpio para eliminar duplicados
    const uniqueCases = Array.from(new Map(processedData.map(item => [item['Nro de Case'], item])).values());
    
    const claimsByReason = uniqueCases.reduce((acc, caseItem) => {
        const reason = caseItem['Razón'] || 'No Especificado';
        if (!acc[reason]) {
            acc[reason] = [];
        }
        acc[reason].push(caseItem);
        return acc;
    }, {});

    return { claimsByReason, totalClaims: uniqueCases.length, startDate: oneWeekAgo };
}
