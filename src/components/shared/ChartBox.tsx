import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"

interface ChartBoxProps {
  title: string
  children: React.ReactNode
  className?: string
  height?: string
}

export function ChartBox({ title, children, className, height = "h-[300px]" }: ChartBoxProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200">
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