import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, parseOFX, type ImportedTransaction } from '@/utils/parsers';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';

const Import = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { createTransactions } = useTransactions(user?.id);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file =>
            file.name.endsWith('.csv') || file.name.endsWith('.ofx') || file.name.endsWith('.pdf')
        );

        if (validFiles.length !== droppedFiles.length) {
            toast({
                title: "Arquivo inválido",
                description: "Apenas arquivos .csv, .ofx e .pdf são aceitos.",
                variant: "destructive"
            });
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);

        let totalImported = 0;
        let errors = 0;
        const allTransactions: ImportedTransaction[] = [];

        try {
            for (const file of files) {
                try {
                    let transactions: ImportedTransaction[] = [];
                    if (file.name.endsWith('.csv')) {
                        transactions = await parseCSV(file);
                    } else if (file.name.endsWith('.ofx')) {
                        transactions = await parseOFX(file);
                    } else {
                        console.warn(`File type not supported yet: ${file.name}`);
                        continue;
                    }
                    allTransactions.push(...transactions);
                } catch (err) {
                    console.error(`Error parsing file ${file.name}:`, err);
                    errors++;
                }
            }

            if (allTransactions.length > 0) {
                // Map ImportedTransaction to TransactionInput
                const transactionsToCreate = allTransactions.map(t => ({
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    category: 'outros', // Default category, ideally we'd map this or ask user
                    date: t.date,
                    payment_method: 'bank_transfer', // Default
                    is_recurring: false
                }));

                await createTransactions(transactionsToCreate);
                totalImported = transactionsToCreate.length;

                toast({
                    title: "Importação concluída",
                    description: `${totalImported} transações importadas com sucesso. ${errors > 0 ? `${errors} arquivos com erro.` : ''}`,
                });

                // Clear files and navigate to dashboard or show success state
                setFiles([]);
                navigate('/dashboard');
            } else {
                toast({
                    title: "Nenhuma transação encontrada",
                    description: "Não foi possível ler transações dos arquivos selecionados.",
                    variant: "destructive"
                });
            }

        } catch (error: any) {
            console.error("Import error:", error);
            toast({
                title: "Erro na importação",
                description: error.message || "Ocorreu um erro ao salvar as transações.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Importar Transações</h1>
                <p className="text-muted-foreground">
                    Importe seus extratos bancários (OFX, CSV ou PDF) para atualizar seu fluxo de caixa automaticamente.
                </p>
            </div>

            <Card className="border-dashed border-2 bg-muted/20">
                <CardContent
                    className={`flex flex-col items-center justify-center p-12 transition-colors ${isDragging ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Arraste e solte seus arquivos aqui</h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                        Suporta arquivos OFX e CSV. PDF em breve. Você pode importar múltiplos arquivos de uma vez.
                    </p>
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept=".csv,.ofx,.pdf"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outline" className="cursor-pointer" disabled={isProcessing} asChild>
                                <span>Selecionar Arquivos</span>
                            </Button>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {files.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Arquivos Selecionados</CardTitle>
                        <CardDescription>Revise os arquivos antes de processar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <FileText className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                    disabled={isProcessing}
                                >
                                    Remover
                                </Button>
                            </div>
                        ))}
                        <div className="flex justify-end pt-4">
                            <Button onClick={processFiles} disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    `Processar ${files.length} arquivos`
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Import;
