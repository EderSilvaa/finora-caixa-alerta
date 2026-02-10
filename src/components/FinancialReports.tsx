import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialReports, DRELineItem } from '@/hooks/useFinancialReports';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FileText, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialReportsProps {
    transactions: Transaction[];
    currentDate?: Date;
}

export const FinancialReports = ({ transactions, currentDate = new Date() }: FinancialReportsProps) => {
    const { dreData } = useFinancialReports(transactions, currentDate);
    const [activeTab, setActiveTab] = useState("dre");

    const getRowStyle = (item: DRELineItem) => {
        if (item.isTotal) return "font-bold bg-muted/30";
        if (item.level === 1) return "pl-8 text-sm text-muted-foreground";
        return "text-sm";
    };

    const getValueColor = (item: DRELineItem) => {
        if (item.type === 'revenue') return 'text-success';
        if (item.type === 'cost' || item.type === 'expense') return 'text-destructive';
        if (item.value < 0) return 'text-destructive';
        return 'text-foreground';
    }

    return (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Relatórios Financeiros
                        </CardTitle>
                        <CardDescription>
                            Análise detalhada de {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Future: Date Picker */}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="dre" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="dre">DRE (Demonstrativo de Resultado)</TabsTrigger>
                        <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dre" className="space-y-4">
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="text-left p-4 font-semibold text-sm">Descrição</th>
                                        <th className="text-right p-4 font-semibold text-sm">Valor</th>
                                        <th className="text-right p-4 font-semibold text-sm w-24">A.V. %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dreData.items.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${getRowStyle(item)}`}
                                        >
                                            <td className="p-4 flex items-center gap-2">
                                                {item.type === 'revenue' && <TrendingUp className="w-4 h-4 text-success opacity-70" />}
                                                {item.type === 'expense' && <TrendingDown className="w-4 h-4 text-destructive opacity-70" />}
                                                {item.type === 'result' && <DollarSign className="w-4 h-4 text-primary opacity-70" />}
                                                {item.name}
                                            </td>
                                            <td className={`p-4 text-right ${getValueColor(item)}`}>
                                                {formatCurrency(item.value)}
                                            </td>
                                            <td className="p-4 text-right text-muted-foreground text-xs">
                                                {item.percentage.toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground mb-1">Margem Bruta</p>
                                <p className="text-2xl font-bold text-primary">
                                    {((dreData.grossProfit / dreData.netRevenue) * 100 || 0).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground mb-1">Margem Operacional</p>
                                <p className="text-2xl font-bold text-primary">
                                    {((dreData.operatingExpenses / dreData.netRevenue) * 100 || 0).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground mb-1">Margem Líquida</p>
                                <p className="text-2xl font-bold text-primary">
                                    {((dreData.netIncome / dreData.netRevenue) * 100 || 0).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cashflow">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Fluxo de Caixa Detalhado</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    A visualização detalhada de fluxo de caixa (Operacional, Investimento, Financiamento) estará disponível em breve.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
