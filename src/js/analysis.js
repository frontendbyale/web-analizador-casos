// src/js/analysis.js

/**
 * Limpia y prepara los datos crudos del CSV.
 * Convierte fechas, extrae números de caso, y elimina duplicados.
 */
export function prepareData(rawData) {
    const processedData = rawData.map(row => ({
        ...row,
        'caseHtml': row['Nro. Case'],
        'Nro de Case': row['Nro. Case'] ? parseInt(row['Nro. Case'].match(/>(\d+)</)?.[1], 10) : null,
        'Fecha de Creacion': row['Fecha Creación (FFHH)'] ? new Date(row['Fecha Creación (FFHH)']) : null,
        'Fecha de Cierre': row['Fecha Cierre'] ? new Date(row['Fecha Cierre']) : null,
    }));

    const validData = processedData.filter(row => 
        row['Nro de Case'] && 
        row['Fecha de Creacion'] instanceof Date && 
        !isNaN(row['Fecha de Creacion'])
    );
    
    return Array.from(new Map(validData.map(item => [item['Nro de Case'], item])).values());
}

/**
 * Extrae una lista única de agentes del conjunto de datos.
 */
export function getAgentsFromData(data) {
    const agentSet = new Set();
    const serviceAccount = "service-account-abe26a47";
    data.forEach(row => {
        if (row['Empleado Creación'] && row['Empleado Creación'] !== serviceAccount) agentSet.add(row['Empleado Creación']);
        if (row['Empleado Cierre'] && row['Empleado Cierre'] !== serviceAccount) agentSet.add(row['Empleado Cierre']);
        if (row['Usuario Asignado'] && row['Usuario Asignado'] !== serviceAccount) agentSet.add(row['Usuario Asignado']);
    });
    return Array.from(agentSet).sort();
}

/**
 * Procesa los datos para el análisis general.
 */
export function processGeneralAnalysis(filteredData, selectedAgents) {
    const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
    const getTimeBucket = (hours) => {
        if (hours <= 24) return timeBuckets[0]; if (hours <= 48) return timeBuckets[1];
        if (hours <= 72) return timeBuckets[2]; return timeBuckets[3];
    };
    const createStatObject = () => Object.fromEntries(timeBuckets.map(bucket => [bucket, 0]));

    const closedCases = filteredData.filter(c => c['Estado Case'] === 'Closed');
    
    const casesByModel = closedCases.reduce((acc, c) => {
        const model = c['Modelo Comercial'] || 'No especificado';
        if (!acc[model]) acc[model] = [];
        acc[model].push(c);
        return acc;
    }, {});

    const resolutionByModel = {};
    for (const model in casesByModel) {
        const stats = createStatObject();
        casesByModel[model].forEach(c => {
            if (c['Fecha de Cierre'] instanceof Date && !isNaN(c['Fecha de Cierre'])) {
                const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
                stats[getTimeBucket(diffHours)]++;
            }
        });
        resolutionByModel[model] = stats;
    }

    const openCases = filteredData.filter(c => c['Estado Case'] !== 'Closed');
    const openCasesAssignedTo = Object.fromEntries(selectedAgents.map(agent => [agent, 0]));
    openCases.forEach(c => {
        if (selectedAgents.includes(c['Usuario Asignado'])) {
            openCasesAssignedTo[c['Usuario Asignado']]++;
        }
    });
    
    const webUser = "service-account-abe26a47";
    const webCreatedCases = filteredData.filter(c => c['Empleado Creación'] === webUser);
    const webCasesClosedByAgent = Object.fromEntries(selectedAgents.map(agent => [agent, 0]));
    webCreatedCases.forEach(c => {
        if (c['Estado Case'] === 'Closed' && selectedAgents.includes(c['Empleado Cierre'])) {
            webCasesClosedByAgent[c['Empleado Cierre']]++;
        }
    });

    const overallAgentActivity = Object.fromEntries(selectedAgents.map(agent => [agent, { created: 0, closed: 0 }]));
    filteredData.forEach(c => {
        if (selectedAgents.includes(c['Empleado Creación'])) overallAgentActivity[c['Empleado Creación']].created++;
        if (c['Estado Case'] === 'Closed' && selectedAgents.includes(c['Empleado Cierre'])) overallAgentActivity[c['Empleado Cierre']].closed++;
    });

    const overallClosureStats = createStatObject();
    closedCases.forEach(c => {
        if (c['Fecha de Cierre'] instanceof Date && !isNaN(c['Fecha de Cierre'])) {
            const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
            overallClosureStats[getTimeBucket(diffHours)]++;
        }
    });

    const agentPerformance = Object.fromEntries(selectedAgents.map(agent => [agent, { totalClosed: 0, overall: createStatObject(), byReason: {} }]));
    closedCases.forEach(c => {
        const closer = c['Empleado Cierre'];
        if (!selectedAgents.includes(closer) || !(c['Fecha de Cierre'] instanceof Date) || isNaN(c['Fecha de Cierre'])) return;
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

    return { 
        filteredCases: filteredData, closedCases, openCases, openCasesAssignedTo,
        webCreatedCasesCount: webCreatedCases.length, webCasesClosedByAgent,
        overallAgentActivity, overallClosureStats, agentPerformance,
        resolutionByModel
    };
}


export function processWeeklyAnalysis(allCleanData) {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const weeklyCases = allCleanData.filter(c => c['Fecha de Creacion'] >= oneWeekAgo);
    
    const claimsByReason = weeklyCases.reduce((acc, caseItem) => {
        const reason = caseItem['Razón'] || 'No Especificado';
        if (!acc[reason]) acc[reason] = [];
        acc[reason].push(caseItem);
        return acc;
    }, {});

    return { claimsByReason, totalClaims: weeklyCases.length, startDate: oneWeekAgo };
}

export function processTopStats(data) {
    const closedCasesWithChildren = data.filter(c => 
        c['Estado Case'] === 'Closed' &&
        c['Nro. Case Hijo'] && 
        c['Nro. Case Hijo'].trim() !== ''
    );
    const casesBySegment = closedCasesWithChildren.reduce((acc, c) => {
        const segment = c['Segmento Comercial'] || 'No especificado';
        if (!acc[segment]) acc[segment] = [];
        acc[segment].push(c);
        return acc;
    }, {});
    const topClientsBySegment = {};
    for (const segment in casesBySegment) {
        const clientCounts = casesBySegment[segment].reduce((acc, c) => {
            const client = c['Cliente'] || 'No especificado';
            if (!acc[client]) acc[client] = { cases: [], segment: c['Segmento Comercial'] };
            acc[client].cases.push(c.caseHtml || `Case #${c['Nro de Case']}`);
            return acc;
        }, {});
        topClientsBySegment[segment] = Object.entries(clientCounts)
            .sort(([, a], [, b]) => b.cases.length - a.cases.length).slice(0, 10)
            .map(([client, data], index) => ({
                rank: index + 1, client, count: data.cases.length, cases: data.cases, segment: data.segment
            }));
    }
    const diagnosisData = closedCasesWithChildren.reduce((acc, c) => {
        const diagnosis = c['Diagnóstico'] || 'No Especificado';
        const solution = c['Solución'] || 'Sin solución detallada';
        if (!acc[diagnosis]) acc[diagnosis] = { count: 0, solutions: {} };
        acc[diagnosis].count++;
        acc[diagnosis].solutions[solution] = (acc[diagnosis].solutions[solution] || 0) + 1;
        return acc;
    }, {});
    const topDiagnosticos = Object.entries(diagnosisData)
        .sort(([, a], [, b]) => b.count - a.count).slice(0, 5)
        .map(([diagnosis, data], index) => ({
            rank: index + 1, diagnosis, count: data.count,
            solutions: Object.entries(data.solutions).sort(([, a], [, b]) => b - a)
        }));
    const allSegments = Object.keys(topClientsBySegment).sort();
    return { allSegments, topClientsBySegment, topDiagnosticos };
}


export function processEscalationAnalysis(data) {
    const parentCases = data.filter(c => {
        const childCaseHtml = c['Nro. Case Hijo'];
        return typeof childCaseHtml === 'string' && />(\d+)</.test(childCaseHtml);
    });
    const escalatedCasesList = parentCases.map(c => ({
        parentCase: c.caseHtml || `Case #${c['Nro de Case']}`,
        childCase: c['Nro. Case Hijo'],
        destinationBandeja: c['Bandeja hijo'] || 'No especificada'
    }));
    const bandejaCounts = parentCases.reduce((acc, c) => {
        const bandeja = c['Bandeja hijo'] || 'No especificada';
        acc[bandeja] = (acc[bandeja] || 0) + 1;
        return acc;
    }, {});
    return { escalatedCasesList, bandejaCounts };
}


export function processYearlyAnalysis(allCleanData) {
    const currentYear = new Date().getFullYear();
    const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
    const getTimeBucket = (hours) => {
        if (hours <= 24) return timeBuckets[0]; if (hours <= 48) return timeBuckets[1];
        if (hours <= 72) return timeBuckets[2]; return timeBuckets[3];
    };
    const closedCasesThisYear = allCleanData.filter(c => 
        c['Estado Case'] === 'Closed' && 
        c['Fecha de Cierre'] instanceof Date && 
        !isNaN(c['Fecha de Cierre']) && 
        c['Fecha de Cierre'].getFullYear() === currentYear
    );
    const monthlyData = {
        'Menos de 24hs': Array(12).fill(0), 'Entre 24hs y 48hs': Array(12).fill(0),
        'Entre 48hs y 72hs': Array(12).fill(0), 'Más de 72hs': Array(12).fill(0)
    };
    closedCasesThisYear.forEach(c => {
        const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
        const category = getTimeBucket(diffHours);
        const month = c['Fecha de Cierre'].getMonth();
        if (monthlyData[category]) monthlyData[category][month]++;
    });
    return { monthlyData, year: currentYear };
}

/**
 * --- FUNCIÓN ACTUALIZADA ---
 * Procesa los datos de sesiones para calcular métricas de Contact Center, incluyendo ASQ.
 */
export function processContactCenterAnalysis(data) {
    const validSessions = data.filter(row => row['Id Sesión'] && row['Id Sesión'].trim() !== '');

    // Variables para los totales
    let totalChatsAnswered = 0;
    let totalTransfers = 0;
    let totalHandleTime = 0;

    // Variables para promedios (Sumas y Conteos)
    let asqSum = 0, asqCount = 0;
    let asaSum = 0, asaCount = 0;
    let slCount = 0, slMet = 0;

    validSessions.forEach(session => {
        const answeredCount = parseInt(session['Conversaciones cerradas'], 10);

        // --- NUEVA LÓGICA DE CLASIFICACIÓN ---
        if (answeredCount > 0) {
            // Si hay conversaciones cerradas, la sesión cuenta como ATENDIDA.
            totalChatsAnswered += answeredCount;
            totalHandleTime += (parseFloat(session['Conversación con agente']) || 0) * answeredCount;

            const waitTimeQueue = parseFloat(session['Espera en cola']); // ASQ
            const waitTimeAgent = parseFloat(session['Espera agente']); // ASA

            // Calcular ASQ solo si hay dato
            if (!isNaN(waitTimeQueue)) {
                asqSum += waitTimeQueue * answeredCount;
                asqCount += answeredCount;
            }
            // Calcular ASA solo si hay dato
            if (!isNaN(waitTimeAgent)) {
                asaSum += waitTimeAgent * answeredCount;
                asaCount += answeredCount;
            }
            // Calcular Service Level solo si ambos datos existen
            if (!isNaN(waitTimeQueue) && !isNaN(waitTimeAgent)) {
                const totalWait = waitTimeQueue + waitTimeAgent;
                const serviceLevelThreshold = 60;
                slCount += answeredCount;
                if (totalWait <= serviceLevelThreshold) {
                    slMet += answeredCount;
                }
            }
        } else {
            // Si no hay conversaciones cerradas, la sesión cuenta como TRANSFERIDA.
            totalTransfers++;
        }
    });

    // Calculamos los promedios finales
    const asq = asqCount > 0 ? asqSum / asqCount : 0;
    const asa = asaCount > 0 ? asaSum / asaCount : 0;
    const aht = totalChatsAnswered > 0 ? totalHandleTime / totalChatsAnswered : 0;
    const serviceLevel = slCount > 0 ? (slMet / slCount) * 100 : 0;

    const totalChats = totalChatsAnswered + totalTransfers;

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        totalChats,
        totalChatsAnswered,
        totalTransfers,
        asa: formatTime(asa),
        asq: formatTime(asq),
        aht: formatTime(aht),
        serviceLevel: serviceLevel.toFixed(1) + '%'
    };
}