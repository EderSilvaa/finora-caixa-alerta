import { useMemo } from 'react';
import { Transaction } from '@/types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export interface DRELineItem {
    name: string;
    value: number;
    percentage: number; // Vertical analysis % based on Net Revenue
    type: 'revenue' | 'cost' | 'expense' | 'result';
    isTotal?: boolean;
    level?: number; // Indentation level
}

export interface DREData {
    grossRevenue: number;
    deductions: number;
    netRevenue: number;
    variableCosts: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    netIncome: number;
    items: DRELineItem[];
}

export function useFinancialReports(transactions: Transaction[], month: Date) {
    const dreData = useMemo(() => {
        // 1. Filter transactions for the selected month
        const range = {
            start: startOfMonth(month),
            end: endOfMonth(month),
        };

        const monthlyTransactions = transactions.filter((t) =>
            isWithinInterval(parseISO(t.date), range)
        );

        // 2. Aggregate by Category Mapping
        let grossRevenue = 0;
        let deductions = 0;
        let variableCosts = 0;
        let operatingExpenses = 0;

        // Helper to sum by category list
        const sumByCategories = (categories: string[], type: 'income' | 'expense') => {
            return monthlyTransactions
                .filter((t) => t.type === type && categories.includes(t.category))
                .reduce((sum, t) => sum + t.amount, 0);
        };

        // Mappings
        const revenueCats = ['Vendas', 'Receita', 'Outros']; // 'Outros' in income usually revenue
        const deductionCats = ['Impostos']; // Taxes on sales
        const variableCostCats = ['Fornecedores', 'Variável'];
        const expenseCats = ['Fixo', 'Salários', 'Aluguel', 'Serviços', 'Marketing', 'Outros']; // 'Outros' in expense

        // Calculate Totals
        grossRevenue = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Specific deductions (e.g. tax on revenue) - Approximating with 'Impostos' category being deductions
        // Note: 'Impostos' could be fixed expense too, but for simplified DRE we can put it as deduction or expense.
        // Let's assume 'Impostos' is a deduction from Gross Revenue for now to show the line.
        deductions = sumByCategories(['Impostos'], 'expense');

        const netRevenue = grossRevenue - deductions;

        variableCosts = sumByCategories(variableCostCats, 'expense');

        const grossProfit = netRevenue - variableCosts;

        // Operating Expenses (Fixed)
        // We sum all expenses that are NOT Variable Costs and NOT Deductions (Impostos)
        operatingExpenses = monthlyTransactions
            .filter(t => t.type === 'expense' &&
                !variableCostCats.includes(t.category) &&
                !deductionCats.includes(t.category))
            .reduce((sum, t) => sum + t.amount, 0);

        const ebitda = grossProfit - operatingExpenses;

        // Net Income (Assuming no further Interest/Depreciation for now)
        const netIncome = ebitda;

        // 3. Build Line Items for UI
        const getPercent = (val: number) => (netRevenue === 0 ? 0 : (val / netRevenue) * 100);

        const items: DRELineItem[] = [
            { name: 'Receita Bruta', value: grossRevenue, percentage: getPercent(grossRevenue), type: 'revenue', level: 0 },
            { name: '(-) Deduções / Impostos', value: deductions, percentage: getPercent(deductions), type: 'cost', level: 0 },
            { name: '(=) Receita Líquida', value: netRevenue, percentage: 100, type: 'result', isTotal: true, level: 0 },

            { name: '(-) Custos Variáveis (CMV/CPV)', value: variableCosts, percentage: getPercent(variableCosts), type: 'cost', level: 0 },
            { name: '(=) Lucro Bruto', value: grossProfit, percentage: getPercent(grossProfit), type: 'result', isTotal: true, level: 0 },

            { name: '(-) Despesas Operacionais', value: operatingExpenses, percentage: getPercent(operatingExpenses), type: 'expense', level: 0 },
            // Optional breakdown could go here with level 1

            { name: '(=) EBITDA / Lucro Operacional', value: ebitda, percentage: getPercent(ebitda), type: 'result', isTotal: true, level: 0 },
            { name: '(=) Lucro Líquido', value: netIncome, percentage: getPercent(netIncome), type: 'result', isTotal: true, level: 0 },
        ];

        return {
            grossRevenue,
            deductions,
            netRevenue,
            variableCosts,
            grossProfit,
            operatingExpenses,
            ebitda,
            netIncome,
            items,
        };
    }, [transactions, month]);

    return { dreData };
}
