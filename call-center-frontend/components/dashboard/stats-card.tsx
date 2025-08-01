import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  trend?: {
    value: string
    icon: LucideIcon
    positive?: boolean
  }
}

export function StatsCard({ title, value, subtitle, icon: Icon, gradient, badge, trend }: StatsCardProps) {
  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-r ${gradient} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10 opacity-30"></div>
      <CardContent className="p-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg shadow-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/90">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{value}</p>
              {badge && (
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                  {badge.text}
                </Badge>
              )}
            </div>
            {(subtitle || trend) && (
              <div className="flex items-center gap-2 mt-1">
                {trend && (
                  <div className="text-xs text-white/80 flex items-center gap-1">
                    <trend.icon className="h-3 w-3" />
                    {trend.value}
                  </div>
                )}
                {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
