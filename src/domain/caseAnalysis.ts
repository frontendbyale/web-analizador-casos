/**
 * --- DOMINIO: ANÁLISIS DE DATOS ---
 * Funciones puras para el procesamiento y análisis de casos.
 */

import type { TCase, TGeneralAnalysis } from "./types";

export function prepareData(rawData: any[]): TCase[] {
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
        !isNaN(row['Fecha de Creacion'].getTime())
    );
    
    // Eliminar duplicados por Nro de Case
    return Array.from(new Map(validData.map(item => [item['Nro de Case'], item])).values()) as TCase[];
}

export function getAgentsFromData(data: any[]): string[] {
    const agentSet = new Set<string>();
    const serviceAccount = "service-account-abe26a47";
    data.forEach(row => {
        if (row['Empleado Creación'] && row['Empleado Creación'] !== serviceAccount) agentSet.add(row['Empleado Creación']);
        if (row['Empleado Cierre'] && row['Empleado Cierre'] !== serviceAccount) agentSet.add(row['Empleado Cierre']);
        if (row['Usuario Asignado'] && row['Usuario Asignado'] !== serviceAccount) agentSet.add(row['Usuario Asignado']);
    });
    return Array.from(agentSet).sort();
}

export function analyzeGeneralCases(filteredData: TCase[], selectedAgents: string[]): TGeneralAnalysis {
    console.log("Ejecutando analyzeGeneralCases v2 con agentes:", selectedAgents);
    const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
    const getTimeBucket = (hours: number) => {
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
    }, {} as any);

    const resolutionByModel: Record<string, Record<string, number>> = {};
    for (const model in casesByModel) {
        const stats = createStatObject();
        casesByModel[model].forEach((c: any) => {
            if (c['Fecha de Cierre'] instanceof Date && !isNaN(c['Fecha de Cierre'].getTime())) {
                const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
                stats[getTimeBucket(diffHours)]++;
            }
        });
        resolutionByModel[model] = stats;
    }

    const openCases = filteredData.filter(c => c['Estado Case'] !== 'Closed');
    const openCasesAssignedTo: Record<string, number> = Object.fromEntries(selectedAgents.map(agent => [agent, 0]));
    openCases.forEach(c => {
        if (selectedAgents.includes(c['Usuario Asignado'])) {
            openCasesAssignedTo[c['Usuario Asignado']]++;
        }
    });
    
    const webUser = "service-account-abe26a47";
    const webCreatedCases = filteredData.filter(c => c['Empleado Creación'] === webUser);
    const webCreatedClosed = webCreatedCases.filter(c => c['Estado Case'] === 'Closed');
    const webCreatedOpen = webCreatedCases.filter(c => c['Estado Case'] !== 'Closed');

    const webCreatedDetails = {
        total: webCreatedCases.length,
        closed: webCreatedClosed.length,
        open: webCreatedOpen.length,
        perAgent: Object.fromEntries(selectedAgents.map(agent => [agent, { assigned: 0, closed: 0 }]))
    };

    webCreatedCases.forEach(c => {
        if (c['Estado Case'] === 'Closed') {
            if (selectedAgents.includes(c['Empleado Cierre'])) {
                webCreatedDetails.perAgent[c['Empleado Cierre']].closed++;
            }
        } else {
            if (selectedAgents.includes(c['Usuario Asignado'])) {
                webCreatedDetails.perAgent[c['Usuario Asignado']].assigned++;
            }
        }
    });

    const agentCreatedDetails: Record<string, { created: number; closed: number; open: number }> = Object.fromEntries(selectedAgents.map(agent => [agent, { created: 0, closed: 0, open: 0 }]));
    const overallAgentActivity: Record<string, { created: number; closed: number }> = Object.fromEntries(selectedAgents.map(agent => [agent, { created: 0, closed: 0 }]));

    filteredData.forEach(c => {
        const creator = c['Empleado Creación'];
        const closer = c['Empleado Cierre'];

        if (selectedAgents.includes(creator)) {
            agentCreatedDetails[creator].created++;
            overallAgentActivity[creator].created++;
            if (c['Estado Case'] === 'Closed') {
                agentCreatedDetails[creator].closed++;
            } else {
                agentCreatedDetails[creator].open++;
            }
        }

        if (c['Estado Case'] === 'Closed' && selectedAgents.includes(closer)) {
            overallAgentActivity[closer].closed++;
        }
    });

    const overallClosureStats: Record<string, number> = createStatObject();
    closedCases.forEach(c => {
        if (c['Fecha de Cierre'] instanceof Date && !isNaN(c['Fecha de Cierre'].getTime())) {
            const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
            overallClosureStats[getTimeBucket(diffHours)]++;
        }
    });

    const agentPerformance: Record<string, { totalClosed: number; overall: Record<string, number>; byReason: Record<string, { total: number; stats: Record<string, number>; model: string }> }> = Object.fromEntries(selectedAgents.map(agent => [agent, { totalClosed: 0, overall: createStatObject(), byReason: {} } as any]));
    closedCases.forEach(c => {
        const closer = c['Empleado Cierre'];
        if (!selectedAgents.includes(closer) || !(c['Fecha de Cierre'] instanceof Date) || isNaN(c['Fecha de Cierre'].getTime())) return;
        const diffHours = (c['Fecha de Cierre'].getTime() - c['Fecha de Creacion'].getTime()) / 3600000;
        const bucket = getTimeBucket(diffHours);
        const reason = c['Razón'] || 'No Especificado';
        const model = c['Modelo Comercial'] || 'No Especificado';
        
        agentPerformance[closer].totalClosed++;
        agentPerformance[closer].overall[bucket]++;
        
        if (!agentPerformance[closer].byReason[reason]) {
            agentPerformance[closer].byReason[reason] = { total: 0, stats: createStatObject(), model: model };
        }
        agentPerformance[closer].byReason[reason].total++;
        agentPerformance[closer].byReason[reason].stats[bucket]++;
    });

    return { 
        filteredCases: filteredData, closedCases, openCases, openCasesAssignedTo,
        webCreatedCasesCount: webCreatedCases.length,
        overallAgentActivity, overallClosureStats, agentPerformance,
        resolutionByModel,
        webCreatedDetails,
        agentCreatedDetails
    };
}

export function processWeeklyAnalysis(allCleanData: TCase[]) {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const weeklyCases = allCleanData.filter(c => c['Fecha de Creacion'] && new Date(c['Fecha de Creacion']) >= oneWeekAgo);

    const claimsByReason: Record<string, TCase[]> = {};
    const nestedAnalysisData: any = {};

    weeklyCases.forEach(row => {
        const razon = row['Razón'] || 'N/A';
        const subrazon = row['Subrazón'] || 'N/A';
        const diagnostico = row['Diagnóstico'] || 'Reclamo aun abierto';
        const solucion = row['Solución'] || 'Reclamo aun abierto';

        if (!claimsByReason[razon]) {
            claimsByReason[razon] = [];
        }
        claimsByReason[razon].push(row);

        const diagSolKey = `${diagnostico} | ${solucion}`;
        if (!nestedAnalysisData[razon]) nestedAnalysisData[razon] = {};
        if (!nestedAnalysisData[razon][subrazon]) nestedAnalysisData[razon][subrazon] = {};
        if (!nestedAnalysisData[razon][subrazon][diagSolKey]) {
            nestedAnalysisData[razon][subrazon][diagSolKey] = 0;
        }
        nestedAnalysisData[razon][subrazon][diagSolKey]++;
    });

    const sortedNestedAnalysis: any = {};
    Object.keys(nestedAnalysisData).forEach(razon => {
        sortedNestedAnalysis[razon] = {};
        Object.keys(nestedAnalysisData[razon]).forEach(subrazon => {
            const diagSolCounts = nestedAnalysisData[razon][subrazon];
            const sortedDiagSol = Object.entries(diagSolCounts)
                .map(([key, count]) => ({ key, count: count as number }))
                .sort((a, b) => b.count - a.count);
            sortedNestedAnalysis[razon][subrazon] = sortedDiagSol;
        });
    });

    return {
        claimsByReason,
        nestedAnalysis: sortedNestedAnalysis,
        totalClaims: weeklyCases.length,
        startDate: oneWeekAgo
    };
}

export function processTopStats(data: TCase[]) {
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
    }, {} as any);
    const topClientsBySegment: any = {};
    for (const segment in casesBySegment) {
        const clientCounts = casesBySegment[segment].reduce((acc: any, c: any) => {
            const client = c['Cliente'] || 'No especificado';
            if (!acc[client]) acc[client] = { cases: [], segment: c['Segmento Comercial'] };
            acc[client].cases.push(c.caseHtml || `Case #${c['Nro de Case']}`);
            return acc;
        }, {} as any);
        topClientsBySegment[segment] = Object.entries(clientCounts)
            .sort(([, a]: any, [, b]: any) => b.cases.length - a.cases.length).slice(0, 10)
            .map(([client, data]: any, index) => ({
                rank: index + 1, client, count: data.cases.length, cases: data.cases, segment: data.segment
            }));
    }
    const diagnosisData = closedCasesWithChildren.reduce((acc: any, c: any) => {
        const diagnosis = c['Diagnóstico'] || 'No Especificado';
        const solution = c['Solución'] || 'Sin solución detallada';
        if (!acc[diagnosis]) acc[diagnosis] = { count: 0, solutions: {} };
        acc[diagnosis].count++;
        acc[diagnosis].solutions[solution] = (acc[diagnosis].solutions[solution] || 0) + 1;
        return acc;
    }, {} as any);
    const topDiagnosticos = Object.entries(diagnosisData)
        .sort(([, a]: any, [, b]: any) => b.count - a.count).slice(0, 5)
        .map(([diagnosis, data]: any, index) => ({
            rank: index + 1, diagnosis, count: data.count,
            solutions: Object.entries(data.solutions).sort(([, a]: any, [, b]: any) => b - a)
        }));
    const allSegments = Object.keys(topClientsBySegment).sort();
    return { allSegments, topClientsBySegment, topDiagnosticos };
}

export function processEscalationAnalysis(data: TCase[]) {
    const parentCases = data.filter(c => {
        const childCaseHtml = c['Nro. Case Hijo'];
        return typeof childCaseHtml === 'string' && />(\d+)</.test(childCaseHtml);
    });
    const escalatedCasesList = parentCases.map(c => ({
        parentCase: c.caseHtml || `Case #${c['Nro de Case']}`,
        childCase: c['Nro. Case Hijo'],
        destinationBandeja: c['Bandeja hijo'] || 'No especificada'
    }));
    const bandejaCounts = parentCases.reduce((acc: any, c: any) => {
        const bandeja = c['Bandeja hijo'] || 'No especificada';
        acc[bandeja] = (acc[bandeja] || 0) + 1;
        return acc;
    }, {} as any);
    return { escalatedCasesList, bandejaCounts };
}

export function processYearlyAnalysis(allCleanData: TCase[]) {
    const currentYear = new Date().getFullYear();
    const timeBuckets = ['Menos de 24hs', 'Entre 24hs y 48hs', 'Entre 48hs y 72hs', 'Más de 72hs'];
    const getTimeBucket = (hours: number) => {
        if (hours <= 24) return timeBuckets[0]; if (hours <= 48) return timeBuckets[1];
        if (hours <= 72) return timeBuckets[2]; return timeBuckets[3];
    };
    const closedCasesThisYear = allCleanData.filter(c => 
        c['Estado Case'] === 'Closed' && 
        c['Fecha de Cierre'] instanceof Date && 
        !isNaN(c['Fecha de Cierre'].getTime()) && 
        c['Fecha de Cierre'].getFullYear() === currentYear
    );
    const monthlyData: any = {
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

export function processContactCenterAnalysis(data: any[]) {
    const validSessions = data.filter(row => row['Id Sesión'] && row['Id Sesión'].trim() !== '');

    const agentMetrics: any = {};

    validSessions.forEach(session => {
        const agentName = session['Nombre Agente'] || 'Sin Nombre';
        const answeredCount = parseInt(session['Conversaciones cerradas'], 10) || 0;
        
        if (!agentMetrics[agentName]) {
            agentMetrics[agentName] = {
                answeredChats: 0, transfers: 0, waitTimeQueue: 0, waitTimeAgent: 0,
                handleTime: 0, slBase: 0, slMet: 0, queues: {} as any
            };
        }

        agentMetrics[agentName].queues[session['Cola'] || 'N/A'] = (agentMetrics[agentName].queues[session['Cola'] || 'N/A'] || 0) + 1;

        if (answeredCount > 0) {
            agentMetrics[agentName].answeredChats += answeredCount;
            agentMetrics[agentName].waitTimeQueue += (parseFloat(session['Espera en cola']) || 0) * answeredCount;
            agentMetrics[agentName].waitTimeAgent += (parseFloat(session['Espera agente']) || 0) * answeredCount;
            agentMetrics[agentName].handleTime += (parseFloat(session['Conversación con agente']) || 0) * answeredCount;
        } else {
            agentMetrics[agentName].transfers++;
        }
        
        const waitTimeQueueForSL = parseFloat(session['Espera en cola']);
        const waitTimeAgentForSL = parseFloat(session['Espera agente']);
        if (!isNaN(waitTimeQueueForSL) && !isNaN(waitTimeAgentForSL)) {
            const totalWait = waitTimeQueueForSL + waitTimeAgentForSL;
            const chatsInSessionForSL = answeredCount > 0 ? answeredCount : 1;
            agentMetrics[agentName].slBase += chatsInSessionForSL;
            if (totalWait <= 60) {
                agentMetrics[agentName].slMet += chatsInSessionForSL;
            }
        }
    });

    const finalAgentPerformance = Object.keys(agentMetrics).map(agent => {
        const metrics = agentMetrics[agent];
        const mainQueue = Object.entries(metrics.queues as any).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';
        const asq = metrics.answeredChats > 0 ? metrics.waitTimeQueue / metrics.answeredChats : 0;
        const asa = metrics.answeredChats > 0 ? metrics.waitTimeAgent / metrics.answeredChats : 0;
        const aht = metrics.answeredChats > 0 ? metrics.handleTime / metrics.answeredChats : 0;
        const serviceLevel = metrics.slBase > 0 ? (metrics.slMet / metrics.slBase) * 100 : 0;
        
        return {
            agent, cola: mainQueue, answeredChats: metrics.answeredChats, transfers: metrics.transfers,
            serviceLevel: serviceLevel.toFixed(1) + '%',
            slMet: metrics.slMet,
            slNotMet: metrics.slBase - metrics.slMet,
            asq, asa, aht,
        };
    });
    
    const totalChatsAnswered = finalAgentPerformance.reduce((sum, a) => sum + a.answeredChats, 0);
    const totalTransfers = finalAgentPerformance.reduce((sum, a) => sum + a.transfers, 0);
    const totalSlMet = Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.slMet, 0);
    const totalSlBase = Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.slBase, 0);
    const overallServiceLevel = totalSlBase > 0 ? (totalSlMet / totalSlBase) * 100 : 0;
    const overallASQ = totalChatsAnswered > 0 ? Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.waitTimeQueue, 0) / totalChatsAnswered : 0;
    const overallASA = totalChatsAnswered > 0 ? Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.waitTimeAgent, 0) / totalChatsAnswered : 0;
    const overallAHT = totalChatsAnswered > 0 ? Object.values(agentMetrics).reduce((sum: number, m: any) => sum + m.handleTime, 0) / totalChatsAnswered : 0;

    return {
        general: {
            totalChats: totalChatsAnswered + totalTransfers,
            totalChatsAnswered, totalTransfers,
            serviceLevel: overallServiceLevel,
            slMet: totalSlMet,
            slNotMet: totalSlBase - totalSlMet,
            asq: overallASQ, asa: overallASA, aht: overallAHT,
        },
        agentPerformance: finalAgentPerformance
    };
}
