// Centralized service exports to avoid module resolution issues in production builds
export { authService } from './auth.service'
export { transactionsService } from './transactions.service'
export { syncService } from './sync.service'
export { exportService } from './export.service'
export { notificationService } from './notification.service'
export { pluggyService } from './pluggy.service'
export { aiService } from './ai.service'

// Re-export types
export type { AIInsight, BalancePrediction, SpendingPattern, AnomalyDetection } from './ai.service'
export type { ExportData, ExportOptions } from './export.service'
export type { NotificationPreferences } from './notification.service'
