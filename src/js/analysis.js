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
        'caseHtml': row['Nro. Case'],
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

    // Agrupamos los casos cerrados por segmento comercial
    const casesBySegment = closedCases.reduce((acc, c) => {
        const segment = c['Segmento Comercial'] || 'No especificado';
        if (!acc[segment]) {
            acc[segment] = [];
        }
        acc[segment].push(c);
        return acc;
    }, {});

    // Para cada segmento, calculamos las estadísticas de tiempo de cierre
    const resolutionBySegment = {};
    for (const segment in casesBySegment) {
        const segmentCases = casesBySegment[segment];
        const stats = createStatObject(); // { '<24hs': 0, ... }
        
        segmentCases.forEach(c => {
            const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
            const bucket = getTimeBucket(diffHours);
            stats[bucket]++;
        });
        resolutionBySegment[segment] = stats;
    }

    // Conteo de casos abiertos asignados a cada agente
    const openCasesAssignedTo = Object.fromEntries(agents.map(agent => [agent, 0]));
    openCases.forEach(c => {
        const assignedUser = c['Usuario Asignado'];
        if (agents.includes(assignedUser)) {
            openCasesAssignedTo[assignedUser]++;
        }
    });

    // Tomamos el usuario de creacion de reclamos por la web
    const webUser = "service-account-abe26a47";

    // Filtramos los casos creados por la cuenta de servicio (web)
    const webCreatedCases = filteredCases.filter(c => c['Empleado Creación'] === webUser);

    // De esos casos web, contamos cuántos cerró cada agente
    const webCasesClosedByAgent = Object.fromEntries(agents.map(agent => [agent, 0]));
    webCreatedCases.forEach(c => {
        if (c['Estado Case'] === 'Closed' && agents.includes(c['Empleado Cierre'])) {
            webCasesClosedByAgent[c['Empleado Cierre']]++;
        }
    });

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
        webCreatedCasesCount: webCreatedCases.length, 
        webCasesClosedByAgent,                        
        openCases, 
        openCasesAssignedTo, 
        overallAgentActivity, 
        overallClosureStats, 
        agentPerformance,
        resolutionBySegment
    };
}

/**
 * Procesa los datos para encontrar reclamos en la última semana.
 * @param {Array} data - Los datos crudos del CSV.
 * @returns {Object} - El análisis de reclamos semanales.
 */
export function processWeeklyAnalysis(data, year, month) {
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
    const filteredCases = uniqueCases.filter(row => {
        const d = row['Fecha de Creacion'];
        return d && d.getFullYear() === year && d.getMonth() === month;
    });
    
    const claimsByReason = uniqueCases.reduce((acc, caseItem) => {
        const reason = caseItem['Razón'] || 'No Especificado';
        if (!acc[reason]) {
            acc[reason] = [];
        }
        acc[reason].push(caseItem);
        return acc;
    }, {});

    return { filteredCases, claimsByReason, totalClaims: uniqueCases.length, startDate: oneWeekAgo };
}

/**
 * Procesa los datos para generar rankings de Top Clientes y Top Diagnósticos.
 * @param {Array} data - Los datos crudos del CSV.
 * @returns {Object} - Un objeto con los rankings.
 */
export function processTopStats(data) {
    const closedCasesWithChildren = data.filter(c => 
        c['Estado Case'] === 'Closed' &&
        c['Nro. Case Hijo'] && 
        c['Nro. Case Hijo'].trim() !== ''
    );

    // 1. Agrupamos los casos por su segmento comercial
    const casesBySegment = closedCasesWithChildren.reduce((acc, c) => {
        const segment = c['Segmento Comercial'] || 'No especificado';
        if (!acc[segment]) {
            acc[segment] = [];
        }
        acc[segment].push(c);
        return acc;
    }, {});

    // 2. Para cada segmento, calculamos su propio Top 10 de clientes
    const topClientsBySegment = {};
    for (const segment in casesBySegment) {
        const clientCounts = casesBySegment[segment].reduce((acc, c) => {
            const client = c['Cliente'] || 'No especificado';
            if (!acc[client]) {
                acc[client] = { cases: [], segment: c['Segmento Comercial'] };
            }
            acc[client].cases.push(c.caseHtml || `Case #${c['Nro de Case']}`);
            return acc;
        }, {});

        topClientsBySegment[segment] = Object.entries(clientCounts)
            .sort(([, a], [, b]) => b.cases.length - a.cases.length)
            .slice(0, 10)
            .map(([client, data], index) => ({
                rank: index + 1,
                client,
                count: data.cases.length,
                cases: data.cases,
                segment: data.segment
            }));
    }
    
    // 3. --- LÓGICA COMPLETA Y CORREGIDA PARA TOP DIAGNÓSTICOS ---
    const diagnosisData = closedCasesWithChildren.reduce((acc, c) => {
        const diagnosis = c['Diagnóstico'] || 'No Especificado';
        const solution = c['Solución'] || 'Sin solución detallada';

        if (!acc[diagnosis]) {
            acc[diagnosis] = { count: 0, solutions: {} };
        }

        acc[diagnosis].count++;
        acc[diagnosis].solutions[solution] = (acc[diagnosis].solutions[solution] || 0) + 1;
        
        return acc;
    }, {});

    const topDiagnosticos = Object.entries(diagnosisData)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([diagnosis, data], index) => ({
            rank: index + 1,
            diagnosis,
            count: data.count,
            solutions: Object.entries(data.solutions).sort(([, a], [, b]) => b - a)
        }));

    const allSegments = Object.keys(topClientsBySegment).sort();
        
    return { allSegments, topClientsBySegment, topDiagnosticos };
}

/**
 * Procesa los datos para analizar los casos escalados.
 * @param {Array} data - Los datos filtrados del período.
 * @returns {Object} - Un objeto con la lista de escalados y el conteo por bandeja.
 */
export function processEscalationAnalysis(data) {
    // 1. --- FILTRO CLAVE Y DEFINITIVO ---
    // Esta nueva lógica revisa dentro del string HTML y solo incluye las filas
    // si encuentra un número de caso en el enlace.
    const parentCases = data.filter(c => {
        const childCaseHtml = c['Nro. Case Hijo'];
        // Usamos una expresión regular para verificar si hay un número dentro del tag <a>
        // Por ejemplo: <a...>12345</a>. Si lo encuentra, se incluye.
        return typeof childCaseHtml === 'string' && />(\d+)</.test(childCaseHtml);
    });

    // 2. Mapear la información necesaria (usa la data ya filtrada)
    const escalatedCasesList = parentCases.map(c => ({
        parentCase: c.caseHtml || `Case #${c['Nro de Case']}`,
        childCase: c['Nro. Case Hijo'], // Ya sabemos que contiene un link válido
        destinationBandeja: c['Bandeja hijo'] || 'No especificada'
    }));

    // 3. Contar las derivaciones a cada bandeja (usa la data ya filtrada)
    const bandejaCounts = parentCases.reduce((acc, c) => {
        const bandeja = c['Bandeja hijo'] || 'No especificada';
        acc[bandeja] = (acc[bandeja] || 0) + 1;
        return acc;
    }, {});

    return { escalatedCasesList, bandejaCounts };
}


/**
 * --- FUNCIÓN ACTUALIZADA ---
 * Procesa los datos para generar una distribución multi-línea de cierre por mes para el año actual.
 * @param {Array} data - Los datos crudos del CSV.
 * @returns {Object} - Un objeto con los conteos mensuales para cada categoría de tiempo.
 */
export function processYearlyAnalysis(data) {
    const currentYear = new Date().getFullYear();
    const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
    
    const getTimeBucket = (hours) => {
        if (hours <= 24) return timeBuckets[0];
        if (hours <= 48) return timeBuckets[1];
        if (hours <= 72) return timeBuckets[2];
        return timeBuckets[3];
    };
    
    // 1. Mapeamos los datos para limpiar el N° de Case y convertir fechas.
    let processedData = data.map(row => ({
        ...row,
        'Nro de Case': row['Nro. Case'] ? parseInt(row['Nro. Case'].match(/>(\d+)</)?.[1], 10) : null,
        'Fecha de Creacion': row['Fecha Creación (FFHH)'] ? new Date(row['Fecha Creación (FFHH)']) : null,
        'Fecha de Cierre': row['Fecha Cierre'] ? new Date(row['Fecha Cierre']) : null,
    })).filter(row => row['Nro de Case']); // Quitamos filas sin N° de Case

    // --- CORRECCIÓN CLAVE AQUÍ ---
    // 2. Eliminamos los duplicados usando el N° de Case limpio.
    const uniqueCases = Array.from(new Map(processedData.map(item => [item['Nro de Case'], item])).values());
    
    // 3. Ahora filtramos sobre los casos únicos.
    const closedCasesThisYear = uniqueCases.filter(c => 
        c['Estado Case'] === 'Closed' && 
        c['Fecha de Creacion'] instanceof Date && 
        c['Fecha de Cierre'] instanceof Date && 
        c['Fecha de Cierre'].getFullYear() === currentYear
    );

    const monthlyData = {
        'Menos de 24hs': Array(12).fill(0),
        'Entre 24hs y 48hs': Array(12).fill(0),
        'Entre 48hs y 72hs': Array(12).fill(0),
        'Más de 72hs': Array(12).fill(0)
    };

    closedCasesThisYear.forEach(c => {
        const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
        const category = getTimeBucket(diffHours);
        const month = c['Fecha de Cierre'].getMonth();
        
        if (monthlyData[category]) {
            monthlyData[category][month]++;
        }
    });

    return { monthlyData, year: currentYear };
}