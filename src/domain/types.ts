/**
 * --- DOMINIO: TIPOS ---
 */

export type TCase = {
    'Nro de Case': number | null;
    'Fecha de Creacion': Date | null;
    'Fecha de Cierre': Date | null;
    'Estado Case': string;
    'Modelo Comercial': string;
    'Segmento Comercial': string;
    'Cliente': string;
    'Usuario Asignado': string;
    'Empleado Creación': string;
    'Empleado Cierre': string;
    'Razón': string;
    'Subrazón': string;
    'Diagnóstico': string;
    'Solución': string;
    'Nro. Case Hijo'?: string;
    'Bandeja hijo'?: string;
    [key: string]: any;
}

export type TGeneralAnalysis = {
    filteredCases: TCase[];
    closedCases: TCase[];
    openCases: TCase[];
    openCasesAssignedTo: Record<string, number>;
    webCreatedCasesCount: number;
    overallAgentActivity: Record<string, { created: number; closed: number }>;
    overallClosureStats: Record<string, number>;
    agentPerformance: Record<string, {
        totalClosed: number;
        overall: Record<string, number>;
        byReason: Record<string, {
            total: number;
            stats: Record<string, number>;
            model: string;
        }>;
    }>;
    resolutionByModel: Record<string, Record<string, number>>;
    webCreatedDetails: {
        total: number;
        closed: number;
        open: number;
        perAgent: Record<string, { assigned: number; closed: number }>;
    };
    agentCreatedDetails: Record<string, { created: number; closed: number; open: number }>;
}
