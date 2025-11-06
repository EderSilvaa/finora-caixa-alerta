// Zod Validation Schemas - Finora Caixa Alerta
import { z } from 'zod'

// Transaction schemas
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Tipo de transação é obrigatório',
  }),
  amount: z
    .number({
      required_error: 'Valor é obrigatório',
      invalid_type_error: 'Valor deve ser um número',
    })
    .positive('Valor deve ser maior que zero')
    .max(999999999, 'Valor muito alto'),
  description: z
    .string({
      required_error: 'Descrição é obrigatória',
    })
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição muito longa'),
  category: z.string({
    required_error: 'Categoria é obrigatória',
  }),
  date: z.string().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

// Financial goal schemas
export const financialGoalSchema = z.object({
  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título muito longo'),
  targetAmount: z
    .number({
      required_error: 'Valor da meta é obrigatório',
    })
    .positive('Valor deve ser maior que zero'),
  currentAmount: z.number().nonnegative('Valor atual não pode ser negativo').optional(),
  deadline: z.string().optional(),
})

export type FinancialGoalInput = z.infer<typeof financialGoalSchema>

// Profile schemas
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional(),
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, 'Formato de telefone inválido')
    .optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

// Auth schemas
export const signupSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido'),
  password: z
    .string({
      required_error: 'Senha é obrigatória',
    })
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  companyName: z.string().optional(),
})

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido'),
  password: z.string({
    required_error: 'Senha é obrigatória',
  }),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>

// Categories
export const TRANSACTION_CATEGORIES = [
  'Vendas',
  'Fornecedores',
  'Fixo',
  'Variável',
  'Receita',
  'Salários',
  'Aluguel',
  'Serviços',
  'Marketing',
  'Impostos',
  'Outros',
] as const

export const transactionCategorySchema = z.enum(TRANSACTION_CATEGORIES)
