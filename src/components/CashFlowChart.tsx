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
        <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">Projeção de Fluxo de Caixa</CardTitle>
                            <CardDescription className="text-xs">
                                Previsão para os próximos 120 dias
                                {runwayDays !== undefined && runwayDays < 999 && (
                                    <span className="ml-2 font-semibold text-destructive">
                                        (Runway: ~{runwayDays} dias)
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <div className={`text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        <div className="text-2xl font-bold">
                            {isPositive ? '+' : ''}{formatCurrency(growth)}
                        </div>
                        <div className="text-xs text-muted-foreground">variação prevista</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                                tickLine={false}
                                axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={11}
                                tickLine={false}
                                axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
                                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                formatter={(value: number) => [formatCurrency(value), 'Saldo Projetado']}
                                labelFormatter={(label) => `Data: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
