// Dashboard Skeleton - Animated loading placeholders for better UX
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KPISkeleton() {
  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TransactionsSkeleton() {
  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function GoalsSkeleton() {
  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
