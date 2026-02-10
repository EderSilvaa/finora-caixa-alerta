import Papa from 'papaparse';

export interface ImportedTransaction {
    date: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category?: string;
    raw?: any;
}

export const parseCSV = (file: File): Promise<ImportedTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const transactions: ImportedTransaction[] = results.data.map((row: any) => {
                        // Adjust these field names based on common CSV exports or user input
                        const amount = parseFloat(row.Amount || row.Valor || row.amount || row.valor || '0');
                        const date = row.Date || row.Data || row.date || row.data || new Date().toISOString();
                        const description = row.Description || row.Descricao || row.Memo || row.historico || 'Sem descrição';

                        return {
                            date: new Date(date).toISOString(),
                            amount: Math.abs(amount),
                            description: description,
                            type: amount < 0 ? 'expense' : 'income',
                            raw: row
                        };
                    });
                    resolve(transactions);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const parseOFX = async (file: File): Promise<ImportedTransaction[]> => {
    const text = await file.text();
    const transactions: ImportedTransaction[] = [];

    // Simple regex parser for OFX (BankTranList)
    // This is a basic implementation and might need a robust library for full OFX support
    const regex = /<STMTTRN>[\s\S]*?<TRNTYPE>(.*?)<\/TRNTYPE>[\s\S]*?<DTPOSTED>(.*?)<\/DTPOSTED>[\s\S]*?<TRNAMT>(.*?)<\/TRNAMT>[\s\S]*?<MEMO>(.*?)<\/MEMO>[\s\S]*?<\/STMTTRN>/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
        const [_, type, dateRaw, amountRaw, memo] = match;

        // OFX Date format: YYYYMMDDHHMMSS
        const year = dateRaw.substring(0, 4);
        const month = dateRaw.substring(4, 6);
        const day = dateRaw.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`).toISOString();

        const amount = parseFloat(amountRaw);

        transactions.push({
            date,
            amount: Math.abs(amount),
            description: memo,
            type: amount < 0 ? 'expense' : 'income', // OFX usually sends negative for debit
            raw: match[0]
        });
    }

    return transactions;
};
