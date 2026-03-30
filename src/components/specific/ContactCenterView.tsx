import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Phone,
  UploadCloud,
  Loader2,
  Users,
  Clock,
  Hash,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Hourglass,
} from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

interface ContactCenterViewProps {
  analysis: any;
  onProcessFile: (file: File) => void;
  isLoading: boolean;
}

export function ContactCenterView({
  analysis,
  onProcessFile,
  isLoading,
}: ContactCenterViewProps) {
  const [file, setFile] = React.useState<File | null>(null);

  const handleProcess = () => {
    if (file) onProcessFile(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      {/* HEADER & UPLOAD */}
      <div className="bento-card p-6 flex flex-col md:flex-row items-end justify-between gap-6 bg-gradient-to-r from-brand-blue/5 to-transparent">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-brand-blue" />
            Análisis de Contact Center
          </h2>
          <p className="text-sm text-muted-foreground">
            Procesamiento de registros de llamadas y atención telefónica (TSV)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Archivo TSV
            </Label>
            <Input
              type="file"
              accept=".tsv,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-card h-10 pt-1.5 border-border/60"
            />
          </div>
          <Button
            onClick={handleProcess}
            disabled={isLoading || !file}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold h-10 self-end px-8"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UploadCloud className="w-4 h-4 mr-2" />
            )}
            Procesar
          </Button>
        </div>
      </div>

      {!analysis ? (
        <div className="bento-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
          <div className="bg-slate-100 dark:bg-zinc-900 p-4 rounded-full text-brand-blue">
            <Phone className="w-10 h-10 opacity-20" />
          </div>
          <p className="text-muted-foreground font-medium">
            Carga el reporte de telefonía para ver las métricas de atención.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Total Chats
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">
                  {analysis.totalCalls}
                </h3>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                  <Hash className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Chats Finalizados
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-emerald">
                  {analysis.answeredCalls}
                </h3>
                <div className="p-2 bg-brand-emerald/10 rounded-lg text-brand-emerald">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Chats Derivados
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-red">
                  {analysis.transfers}
                </h3>
                <div className="p-2 bg-brand-red/10 rounded-lg text-brand-red">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                SLA Cumplido (60s)
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-emerald">
                  {analysis.slMet}
                </h3>
                <div className="p-2 bg-brand-emerald/10 rounded-lg text-brand-emerald">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                SLA No Cumplido
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-red">
                  {analysis.slNotMet}
                </h3>
                <div className="p-2 bg-brand-red/10 rounded-lg text-brand-red">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                SLA Atención
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums text-brand-blue">
                  {analysis.serviceLevel ? analysis.serviceLevel.toFixed(2) : 0}%
                </h3>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                AHT (Tiempo Manejo)
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">
                  {Math.floor(analysis.avgDuration / 60)}:
                  {Math.round(analysis.avgDuration % 60)
                    .toString()
                    .padStart(2, "0")}
                </h3>
                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-muted-foreground">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                ASA (Espera Agente)
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">
                  {Math.round(analysis.asa)}s
                </h3>
                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-muted-foreground">
                  <Hourglass className="w-4 h-4" />
                </div>
              </div>
            </Card>

            <Card className="bento-card p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                ASQ (Espera Cola)
              </p>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black tabular-nums">
                  {Math.round(analysis.asq)}s
                </h3>
                <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-muted-foreground">
                  <Hourglass className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bento-card p-5 flex flex-col items-center">
              <CardTitle className="text-lg font-bold text-foreground mb-4">
                Chats Total: Finalizados vs. Derivados
              </CardTitle>
              <div className="w-full max-w-sm">
                <Pie
                  data={{
                    labels: ["Chats Finalizados", "Chats Derivados"],
                    datasets: [
                      {
                        data: [analysis.answeredCalls, analysis.transfers],
                        backgroundColor: ["#10B981", "#EF4444"], // brand-emerald, brand-red
                        borderColor: ["#10B981", "#EF4444"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "bottom" },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.label}: ${context.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>

            <Card className="bento-card p-5 flex flex-col items-center">
              <CardTitle className="text-lg font-bold text-foreground mb-4">
                Rendimiento por Agente (Chats Finalizados)
              </CardTitle>
              <div className="w-full">
                <Bar
                  data={{
                    labels: analysis.details.map(
                      (a: any) => a.agent || "Desconocido",
                    ),
                    datasets: [
                      {
                        label: "Chats Finalizados",
                        data: analysis.details.map((a: any) => a.count),
                        backgroundColor: "#3B82F6", // brand-blue
                        borderColor: "#3B82F6",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </Card>
          </div>

          {/* AGENT BREAKDOWN CARDS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Desglose Individual por Agente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.details?.map((agent: any, i: number) => (
                <Card key={i} className="bento-card p-5">
                  <CardTitle className="text-sm font-semibold mb-3 text-brand-blue">
                    {agent.agent || "Desconocido"}
                  </CardTitle>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Finalizados
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {agent.count}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Derivados
                      </p>
                      <p className="text-lg font-bold tabular-nums text-brand-red">
                        {agent.transfers}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        SLA (%)
                      </p>
                      <p
                        className={`text-lg font-bold tabular-nums ${agent.serviceLevel >= 60 ? "text-brand-emerald" : "text-brand-red"}`}
                      >
                        {agent.serviceLevel ? agent.serviceLevel.toFixed(2) : 0}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        AHT
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {Math.floor(agent.aht / 60)}:
                        {Math.round(agent.aht % 60)
                          .toString()
                          .padStart(2, "0")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        ASA
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {Math.round(agent.asa)}s
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        ASQ
                      </p>
                      <p className="text-lg font-bold tabular-nums">
                        {Math.round(agent.asq)}s
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
