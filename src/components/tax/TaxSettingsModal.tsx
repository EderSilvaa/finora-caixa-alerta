// TaxSettingsModal - Modal para configurar regime tributário
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taxSettingsSchema, type TaxSettingsInput } from '@/lib/validations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save } from 'lucide-react'
import { useTaxSettings } from '@/hooks/useTaxSettings'
import { useToast } from '@/hooks/use-toast'

interface TaxSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaxSettingsModal({ open, onOpenChange }: TaxSettingsModalProps) {
  const { settings, updateSettings, refreshSettings } = useTaxSettings()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaxSettingsInput>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      regime: settings?.regime || 'simples_nacional',
      simples_anexo: settings?.simples_anexo || 'III',
      iss_rate: settings?.iss_rate || 2.0,
      iss_municipality: settings?.iss_municipality || '',
      has_employees: settings?.has_employees || false,
      employee_count: settings?.employee_count || 0,
      prolabore_amount: settings?.prolabore_amount || 0,
    },
  })

  const watchRegime = form.watch('regime')
  const watchHasEmployees = form.watch('has_employees')

  const onSubmit = async (data: TaxSettingsInput) => {
    try {
      setIsSubmitting(true)

      await updateSettings(data)

      toast({
        title: 'Configurações salvas!',
        description: 'Seu regime tributário foi configurado com sucesso.',
      })

      // Aguardar um momento para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 300))

      // Recarregar as configurações do banco
      await refreshSettings()

      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações Tributárias</DialogTitle>
          <DialogDescription>
            Configure seu regime tributário para calcular impostos automaticamente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Regime Tributário */}
            <FormField
              control={form.control}
              name="regime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regime Tributário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                      <SelectItem value="presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="real">Lucro Real</SelectItem>
                      <SelectItem value="mei">MEI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha o regime tributário da sua empresa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anexo do Simples Nacional */}
            {watchRegime === 'simples_nacional' && (
              <FormField
                control={form.control}
                name="simples_anexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anexo do Simples Nacional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o anexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="I">Anexo I - Comércio</SelectItem>
                        <SelectItem value="II">Anexo II - Indústria</SelectItem>
                        <SelectItem value="III">Anexo III - Serviços (Recomendado)</SelectItem>
                        <SelectItem value="IV">Anexo IV - Serviços</SelectItem>
                        <SelectItem value="V">Anexo V - Serviços Específicos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Anexo III é o mais comum para prestadores de serviços
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Taxa de ISS */}
            <FormField
              control={form.control}
              name="iss_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de ISS (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="2.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Alíquota de ISS do seu município (geralmente entre 2% e 5%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Município */}
            <FormField
              control={form.control}
              name="iss_municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Município (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: São Paulo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Município onde sua empresa está registrada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tem Funcionários */}
            <FormField
              control={form.control}
              name="has_employees"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Possui funcionários
                    </FormLabel>
                    <FormDescription>
                      Marque se sua empresa tem funcionários registrados
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Número de Funcionários */}
            {watchHasEmployees && (
              <FormField
                control={form.control}
                name="employee_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Funcionários</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Pró-labore */}
            <FormField
              control={form.control}
              name="prolabore_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pró-labore (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Retirada mensal dos sócios (opcional). Usado para calcular INSS.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
