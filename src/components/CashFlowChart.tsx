import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CashFlowProjection {
    day: number;
    balance: number;
}

interface CashFlowChartProps {
    data: CashFlowProjection[];
    runwayDays?: number;
}

export const CashFlowChart = ({ data, runwayDays }: CashFlowChartProps) => {
    if (!data || data.length === 0) return null;

    const startBalance = data[0]?.balance || 0;
    const endBalance = data[data.length - 1]?.balance || 0;
    const growth = endBalance - startBalance;
    const isPositive = growth >= 0;

    // Format data for chart (add date labels)
    const chartData = data.map(item => {
        const date = new Date();
        date.setDate(date.getDate() + item.day);
        return {
            ...item,
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            formattedBalance: formatCurrency(item.balance),
        };
    });

    return (
        <Card className="border-0 bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground tracking-tight">Projeção de Fluxo de Caixa</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground/80">
                                Previsão para os próximos 120 dias
                                {runwayDays !== undefined && runwayDays < 999 && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold border border-destructive/20 animate-pulse">
                                        Runway: ~{runwayDays} dias
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <div className={`text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        <div className="text-2xl font-bold tracking-tighter drop-shadow-sm">
                            {isPositive ? '+' : ''}{formatCurrency(growth)}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">variação prevista</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <filter id="glow" height="200%" width="200%" x="-50%" y="-50%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={40}
                                dy={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                                dx={-5}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="p-3 rounded-xl bg-popover/80 backdrop-blur-md border border-border/50 shadow-xl ring-1 ring-white/10">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {formatCurrency(payload[0].value as number)}
                                                </p>
                                                <p className="text-[10px] text-primary mt-0.5 font-medium">Saldo Projetado</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                filter="url(#glow)"
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            {/* Background Decorator */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
        </Card>
    );
};
