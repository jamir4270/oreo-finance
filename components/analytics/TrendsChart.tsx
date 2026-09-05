"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AnalyticsTransaction } from "./AnalyticsPageClient";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, LineChart, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendsChartProps {
  transactions: AnalyticsTransaction[];
  allTransactions?: AnalyticsTransaction[];
  baseCurrency: string;
  dateRange: string;
}

export function TrendsChart({
  transactions,
  allTransactions = [],
  baseCurrency,
  dateRange,
}: TrendsChartProps) {
  const [viewMode, setViewMode] = React.useState<"chart" | "calendar">("chart");
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());

  const currencySymbol = React.useMemo(() => getCurrencySymbol(baseCurrency), [baseCurrency]);

  // Group by date, sum income and expenses for chart (filtered by dateRange)
  const chartData = React.useMemo(() => {
    const map = new Map<string, { date: string; expense: number; income: number }>();
    
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.txn_date).getTime() - new Date(b.txn_date).getTime()
    );

    sorted.forEach((t) => {
      if (t.type === "transfer") return;

      const existing = map.get(t.txn_date) || { date: t.txn_date, expense: 0, income: 0 };
      if (t.type === "expense") {
        existing.expense += t.convertedAmount;
      } else if (t.type === "income") {
        existing.income += t.convertedAmount;
      }
      map.set(t.txn_date, existing);
    });

    return Array.from(map.values());
  }, [transactions]);

  // Group by date, sum income and expenses for calendar (using allTransactions to allow free navigation)
  const calendarData = React.useMemo(() => {
    const map = new Map<string, { expense: number; income: number }>();
    allTransactions.forEach((t) => {
      if (t.type === "transfer") return;
      const existing = map.get(t.txn_date) || { expense: 0, income: 0 };
      if (t.type === "expense") {
        existing.expense += t.convertedAmount;
      } else if (t.type === "income") {
        existing.income += t.convertedAmount;
      }
      map.set(t.txn_date, existing);
    });
    return map;
  }, [allTransactions]);

  const chartConfig = {
    income: {
      label: "Income",
      color: "var(--color-oreo-dusty-teal)",
    },
    expense: {
      label: "Expense",
      color: "var(--color-oreo-mauve)",
    },
  } satisfies ChartConfig;

  const hasData = chartData.length > 0;

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="h-full border-0 shadow-sm flex flex-col" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.06), 0 1px 4px rgba(86, 86, 118, 0.03)" }}>
      <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <CardTitle className="font-heading text-2xl text-oreo-slate-purple">Income vs. Expense</CardTitle>
          <CardDescription className="text-sm">
            {viewMode === "chart" ? "Trends over time for selected period" : "Calendar view of daily activity"}
          </CardDescription>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "chart" | "calendar")} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
            <TabsTrigger value="chart" className="flex gap-2 items-center">
              <LineChart className="w-4 h-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex gap-2 items-center">
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-[300px]">
        {viewMode === "chart" && (
          <div className="h-full flex flex-col justify-end">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-8">
                <img src="/oreo.svg" alt="Mascot" className="w-24 h-24 sm:w-32 sm:h-32 opacity-80" />
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  No transactions in this period.
                </p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <defs>
                      <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value + "T00:00:00");
                        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent 
                          className="shadow-oreo-md rounded-xl text-[14px]"
                          indicator="dot" 
                          formatter={(value, name) => (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{name}:</span>
                              <span className="font-mono font-medium">{currencySymbol}{Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Area
                      dataKey="expense"
                      type="monotone"
                      fill="url(#fillExpense)"
                      fillOpacity={1}
                      stroke="var(--color-expense)"
                      strokeWidth={2}
                      stackId="2"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                    <Area
                      dataKey="income"
                      type="monotone"
                      fill="url(#fillIncome)"
                      fillOpacity={1}
                      stroke="var(--color-income)"
                      strokeWidth={2}
                      stackId="1"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        )}

        {viewMode === "calendar" && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-heading text-lg font-medium">
                {monthNames[month]} {year}
              </h3>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-muted/30 p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-background min-h-[80px]" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const data = calendarData.get(dateStr);
                
                const isToday = 
                  day === new Date().getDate() && 
                  month === new Date().getMonth() && 
                  year === new Date().getFullYear();

                return (
                  <div key={`day-${day}`} className="bg-background min-h-[90px] p-1 sm:p-2 border-t border-border/50 flex flex-col gap-1 transition-colors hover:bg-muted/20 min-w-0">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0",
                      isToday ? "bg-oreo-slate-purple text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-auto min-w-0 w-full">
                      {data?.income ? (
                        <div className="text-[10px] sm:text-xs font-mono font-medium text-oreo-dusty-teal truncate bg-oreo-dusty-teal/10 px-1 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 min-w-0">
                          <span className="opacity-70 shrink-0">+</span>
                          <span className="truncate">{formatCompactCurrency(data.income)}</span>
                        </div>
                      ) : null}
                      {data?.expense ? (
                        <div className="text-[10px] sm:text-xs font-mono font-medium text-oreo-mauve truncate bg-oreo-mauve/10 px-1 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 min-w-0">
                          <span className="opacity-70 shrink-0">-</span>
                          <span className="truncate">{formatCompactCurrency(data.expense)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              
              {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                <div key={`empty-end-${i}`} className="bg-background min-h-[80px] border-t border-border/50" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { getCurrencySymbol } from "@/lib/currency";

function formatCompactCurrency(value: number) {
  if (value >= 1000) {
    return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
