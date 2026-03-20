import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"

interface ChartBoxProps {
  title: string
  children: React.ReactNode
  className?: string
  height?: string
}

export function ChartBox({ title, children, className, height = "h-[300px]" }: ChartBoxProps) {
  return (
    <Card className={cn("bento-card border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`relative w-full ${height}`}>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
