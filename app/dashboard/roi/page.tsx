'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from 'recharts'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'

interface InfluencerOption {
  id: number
  name: string
  referralCode: string | null
}

interface RoiTimelinePoint {
  date: string
  [key: string]: number | string
}

interface RoiSummary {
  influencerId: number
  name: string
  referralCode: string | null
  nau: number
  roi: number
}

// Generar NAU y ROI dummy para un rango de fechas y un conjunto de influencers
function generateRoiDummyData(
  start: Date,
  end: Date,
  influencers: InfluencerOption[],
  selectedInfluencerId?: number,
  selectedReferralCode?: string
) {
  const timeline: RoiTimelinePoint[] = []
  const summary: RoiSummary[] = []

  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const effectiveInfluencers =
    selectedInfluencerId || selectedReferralCode
      ? influencers.filter((inf) => {
          if (selectedInfluencerId && inf.id === selectedInfluencerId) return true
          if (selectedReferralCode && inf.referralCode === selectedReferralCode) return true
          return false
        })
      : influencers

  effectiveInfluencers.forEach((inf) => {
    let totalNau = 0

    days.forEach((day, dayIndex) => {
      const key = inf.referralCode || `INF_${inf.id}`
      const seed = inf.id * 37 + dayIndex * 17
      const rand = Math.abs(Math.sin(seed)) // 0..1 aprox

      const baseNau = 5 + rand * 40 // 5–45 NAU por día
      const nau = Math.round(baseNau)
      totalNau += nau

      const dateKey = day.toISOString().split('T')[0]
      let point = timeline.find((p) => p.date === dateKey)
      if (!point) {
        point = { date: dateKey }
        timeline.push(point)
      }
      ;(point as RoiTimelinePoint)[key] = nau
    })

    // ROI dummy en función del NAU total
    const roiSeed = Math.abs(Math.sin(inf.id * 123.456))
    const roi = Number(((roiSeed * 60) - 10).toFixed(1)) // -10% a +50%

    summary.push({
      influencerId: inf.id,
      name: inf.name,
      referralCode: inf.referralCode,
      nau: totalNau,
      roi,
    })
  })

  // Ordenar timeline por fecha
  timeline.sort((a, b) => (a.date as string).localeCompare(b.date as string))

  // Ordenar summary por ROI desc
  summary.sort((a, b) => b.roi - a.roi)

  return { timeline, summary }
}

export default function RoiPage() {
  const [influencers, setInfluencers] = useState<InfluencerOption[]>([])
  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string>('all')
  const [selectedReferralCode, setSelectedReferralCode] = useState<string>('all')
  const [timeline, setTimeline] = useState<RoiTimelinePoint[]>([])
  const [summary, setSummary] = useState<RoiSummary[]>([])
  const [loading, setLoading] = useState(false)

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()),
    []
  )

  const months = [
    { value: '1', label: 'Ene' },
    { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Abr' },
    { value: '5', label: 'May' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Ago' },
    { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dic' },
  ]

  const chartConfig: ChartConfig = useMemo(
    () => ({
      roi: {
        label: 'NAU',
        color: '#6C48C5',
      },
    }),
    []
  )

  const fetchInfluencers = async () => {
    try {
      const res = await fetch('/api/influencers')
      const data = await res.json()
      const apiInfluencers = (data.data || []) as Array<{
        id: number
        name: string
        referralCode: string | null
      }>
      const list: InfluencerOption[] = apiInfluencers.map((inf) => ({
        id: inf.id,
        name: inf.name,
        referralCode: inf.referralCode,
      }))
      setInfluencers(list)
    } catch (error) {
      console.error('Error fetching influencers:', error)
      // Dummy mínimo si falla la API
      setInfluencers([
        { id: 1, name: 'María García', referralCode: 'MARIA2025' },
        { id: 2, name: 'Carlos Rodríguez', referralCode: 'CARLOS2025' },
        { id: 3, name: 'Ana Martínez', referralCode: 'ANA2025' },
      ])
    }
  }

  useEffect(() => {
    // Cargar influencers y luego calcular datos iniciales
    const load = async () => {
      await fetchInfluencers()

      const yearNum = parseInt(year)
      const monthNum = parseInt(month)
      const start = new Date(yearNum, monthNum - 1, 1)
      const end = new Date(yearNum, monthNum, 0)

      const { timeline: t, summary: s } = generateRoiDummyData(start, end, influencers)
      setTimeline(t)
      setSummary(s)
    }

    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recalcular datos cuando cambian filtros (sin tocar fetch de influencers)
  useEffect(() => {
    if (influencers.length === 0) return

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const start = new Date(yearNum, monthNum - 1, 1)
    const end = new Date(yearNum, monthNum, 0)

    const effectiveInfluencerId =
      selectedInfluencerId !== 'all' ? parseInt(selectedInfluencerId) : undefined
    const effectiveReferralCode =
      selectedReferralCode !== 'all' ? selectedReferralCode : undefined

    const { timeline: t, summary: s } = generateRoiDummyData(
      start,
      end,
      influencers,
      effectiveInfluencerId,
      effectiveReferralCode
    )

    setTimeline(t)
    setSummary(s)
    setLoading(false)
  }, [year, month, influencers, selectedInfluencerId, selectedReferralCode])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthLabel = months[date.getMonth()]?.label || ''
    return `${day}-${monthLabel.toLowerCase()}`
  }

  const alerts = useMemo(
    () =>
      summary.filter((item) => item.nau === 0 || item.roi < 0),
    [summary]
  )

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 bg-[#F8F7FC] min-h-full">
              {/* Header y filtros */}
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-2">ROI & NAU</h1>
                  <p className="text-[16px] text-[#6B6B8D]">
                    Analiza la evolución del NAU y el ROI por influencer y código de referido.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Fecha (Año / Mes) */}
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-10 w-[120px] rounded-2xl">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-10 w-[120px] rounded-2xl">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Influencer */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-[#6B6B8D]">Influencer</Label>
                    <Select
                      value={selectedInfluencerId}
                      onValueChange={(value) => setSelectedInfluencerId(value)}
                    >
                      <SelectTrigger className="h-10 w-[220px] rounded-2xl">
                        <SelectValue placeholder="Todos los influencers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los influencers</SelectItem>
                        {influencers.map((inf) => (
                          <SelectItem key={inf.id} value={inf.id.toString()}>
                            {inf.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Código referido */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-[#6B6B8D]">Código referido</Label>
                    <Select
                      value={selectedReferralCode}
                      onValueChange={setSelectedReferralCode}
                    >
                      <SelectTrigger className="h-10 w-[220px] rounded-2xl">
                        <SelectValue placeholder="Todos los códigos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los códigos</SelectItem>
                        {Array.from(
                          new Set(
                            influencers
                              .map((inf) => inf.referralCode)
                              .filter((code): code is string => !!code)
                          )
                        ).map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sección principal: Tabla izquierda + Gráfico derecha */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla dinámica NAU / ROI por influencer */}
                <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                      NAU y ROI por Influencer
                    </CardTitle>
                    <CardDescription className="text-[14px] text-[#6B6B8D]">
                      Código, clientes nuevos y retorno estimado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-[#6B6B8D] text-sm">
                        Calculando datos...
                      </div>
                    ) : summary.length === 0 ? (
                      <div className="text-center py-8 text-[#6B6B8D] text-sm">
                        No hay datos para los filtros seleccionados.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[rgba(108,72,197,0.1)]">
                            <TableHead className="text-[#1A1A2E] font-semibold">Código</TableHead>
                            <TableHead className="text-[#1A1A2E] font-semibold">Influencer</TableHead>
                            <TableHead className="text-[#1A1A2E] font-semibold text-right">
                              Clientes nuevos (NAU)
                            </TableHead>
                            <TableHead className="text-[#1A1A2E] font-semibold text-right">
                              ROI
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.map((row) => (
                            <TableRow
                              key={`${row.influencerId}-${row.referralCode ?? 'none'}`}
                              className="border-[rgba(108,72,197,0.1)]"
                            >
                              <TableCell className="text-[#6B6B8D] text-sm">
                                {row.referralCode ?? '-'}
                              </TableCell>
                              <TableCell className="text-sm font-medium text-[#1A1A2E]">
                                {row.name}
                              </TableCell>
                              <TableCell className="text-right text-sm text-[#1A1A2E]">
                                {row.nau.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                <span
                                  className={
                                    row.roi >= 0
                                      ? 'text-[#4CAF50] font-semibold'
                                      : 'text-[#EF4444] font-semibold'
                                  }
                                >
                                  {row.roi >= 0 ? '+' : ''}
                                  {row.roi.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Gráfico de línea NAU en el tiempo */}
                <Card className="lg:col-span-2 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                      NAU en el tiempo
                    </CardTitle>
                    <CardDescription className="text-[14px] text-[#6B6B8D]">
                      Evolución diaria del NAU por código referido / influencer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    {timeline.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-[#6B6B8D] text-sm">
                        No hay datos para mostrar.
                      </div>
                    ) : (
                      <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timeline} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DEFF" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tick={{ fill: '#6B6B8D', fontSize: 12 }}
                              tickFormatter={(value) => formatDate(value as string)}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#6B6B8D', fontSize: 12 }}
                              tickFormatter={(value) =>
                                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
                              }
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(value) => formatDate(value as string)}
                                  indicator="dot"
                                />
                              }
                            />
                            {/* Una línea por código referido / influencer */}
                            {summary.map((row) => {
                              const key = row.referralCode || `INF_${row.influencerId}`
                              return (
                                <Line
                                  key={key}
                                  type="monotone"
                                  dataKey={key}
                                  name={row.referralCode ? row.referralCode : row.name}
                                  stroke="#6C48C5"
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                >
                                  <LabelList dataKey={key} position="top" />
                                </Line>
                              )
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sección inferior: Ranking ROI y Alertas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking mejor ROI */}
                <Card className="lg:col-span-2 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                      Ranking: Influencers con mejor ROI
                    </CardTitle>
                    <CardDescription className="text-[14px] text-[#6B6B8D]">
                      Ordenados por ROI estimado para el periodo seleccionado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary.length === 0 ? (
                      <div className="text-center py-6 text-[#6B6B8D] text-sm">
                        No hay datos para los filtros seleccionados.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[260px] overflow-y-auto">
                        {summary.slice(0, 10).map((row, index) => (
                          <div
                            key={`${row.influencerId}-${row.referralCode ?? 'none'}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[rgba(108,72,197,0.08)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#E8DEFF] flex items-center justify-center text-xs font-bold text-[#6C48C5]">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A2E]">
                                  {row.name}
                                </p>
                                <p className="text-xs text-[#6B6B8D]">
                                  Código: {row.referralCode ?? '-'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[#6B6B8D] mb-1">ROI</p>
                              <div className="flex items-center justify-end gap-1">
                                {row.roi >= 0 ? (
                                  <IconTrendingUp className="w-3 h-3 text-[#4CAF50]" />
                                ) : (
                                  <IconTrendingDown className="w-3 h-3 text-[#EF4444]" />
                                )}
                                <span
                                  className={
                                    row.roi >= 0
                                      ? 'text-[#4CAF50] font-semibold text-sm'
                                      : 'text-[#EF4444] font-semibold text-sm'
                                  }
                                >
                                  {row.roi >= 0 ? '+' : ''}
                                  {row.roi.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Alertas NAU / ROI */}
                <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                      Alertas
                    </CardTitle>
                    <CardDescription className="text-[14px] text-[#6B6B8D]">
                      Influencers con NAU = 0 o ROI negativo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {alerts.length === 0 ? (
                      <div className="text-sm text-[#6B6B8D]">
                        No hay alertas para el periodo seleccionado.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[260px] overflow-y-auto">
                        {alerts.map((row) => (
                          <div
                            key={`${row.influencerId}-${row.referralCode ?? 'none'}`}
                            className="p-3 rounded-xl bg-[#FFEBEE] text-[#B91C1C]"
                          >
                            <p className="text-sm font-semibold">
                              {row.name} ({row.referralCode ?? 'sin código'})
                            </p>
                            {row.nau === 0 && (
                              <p className="text-xs mt-1">
                                NAU = 0 para el periodo seleccionado.
                              </p>
                            )}
                            {row.roi < 0 && (
                              <p className="text-xs mt-1">
                                ROI negativo de {row.roi.toFixed(1)}%.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

