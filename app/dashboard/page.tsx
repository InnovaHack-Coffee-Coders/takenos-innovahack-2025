'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Legend } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { IconTrendingUp, IconTrendingDown, IconChevronDown, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  reach: { value: number; change: number; isPositive: boolean }
  engagement: { value: number; change: number; isPositive: boolean }
  clicks: { value: number; change: number; isPositive: boolean }
  conversions: { value: number; change: number; isPositive: boolean }
  ctr: { value: number; change: number; isPositive: boolean }
  revenue: { value: number; change: number; isPositive: boolean }
}

interface TimelineData {
  date: string
  views: number
  engagement: number
  conversions: number
  [key: string]: string | number // Para permitir datos dinámicos por plataforma
}

// Generar datos dummy para el mes seleccionado
const generateDummyData = (year: number, month: number): TimelineData[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const data: TimelineData[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateString = date.toISOString().split('T')[0]
    
    // Generar valores aleatorios pero realistas
    const baseViews = 10000 + Math.random() * 50000
    const baseEngagement = 2 + Math.random() * 8 // 2-10%
    const baseConversions = 50 + Math.random() * 200
    
    // Agregar variación diaria
    const dayVariation = Math.sin((day / daysInMonth) * Math.PI * 2) * 0.3 + 1
    
    data.push({
      date: dateString,
      views: Math.round(baseViews * dayVariation),
      engagement: Number((baseEngagement * dayVariation).toFixed(2)),
      conversions: Math.round(baseConversions * dayVariation),
    })
  }
  
  return data
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [influencers, setInfluencers] = useState<Array<{ id: number; name: string }>>([])
  const [platforms, setPlatforms] = useState<Array<{ id: number; name: string; code: string }>>([])
  
  const [year, setYear] = useState<string>(currentYear.toString())
  const [month, setMonth] = useState<string>(currentMonth.toString())
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<number[]>([]) // Array de IDs seleccionados
  const [influencerId, setInfluencerId] = useState<string>('all')
  const [platformsOpen, setPlatformsOpen] = useState(false)
  
  const [loading, setLoading] = useState(true)

  // Generar años disponibles (últimos 5 años)
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  
  // Meses
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

  useEffect(() => {
    fetchPlatforms()
    fetchInfluencers()
  }, [])

  useEffect(() => {
    if (platforms.length >= 0) {
      fetchStats()
      fetchTimeline()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, selectedPlatformIds, influencerId])

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/data/platforms')
      const data = await res.json()
      const platformsData = data.data || []
      console.log('Platforms fetched:', platformsData) // Debug
      setPlatforms(platformsData)
    } catch (error) {
      console.error('Error fetching platforms:', error)
      // En caso de error, establecer plataformas por defecto
      setPlatforms([
        { id: 1, code: 'tiktok', name: 'TikTok' },
        { id: 2, code: 'instagram', name: 'Instagram' },
        { id: 3, code: 'youtube', name: 'YouTube' },
        { id: 4, code: 'x', name: 'X (Twitter)' },
      ])
    }
  }

  const fetchInfluencers = async () => {
    try {
      const res = await fetch('/api/influencers')
      const data = await res.json()
      setInfluencers(data.data || [])
    } catch (error) {
      console.error('Error fetching influencers:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Calcular fechas basadas en año y mes
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      
      params.append('startDate', startDate.toISOString())
      params.append('endDate', endDate.toISOString())
      
      // Agregar múltiples plataformas
      if (selectedPlatformIds.length > 0) {
        selectedPlatformIds.forEach((id) => {
          params.append('socialPlatformId', id.toString())
        })
      }
      if (influencerId && influencerId !== 'all') {
        params.append('influencerId', influencerId)
      }

      const res = await fetch(`/api/dashboard/stats?${params.toString()}`)
      const data = await res.json()
      
      // Si no hay stats, generar datos dummy
      if (!data.data) {
        const dummyTimeline = generateDummyData(parseInt(year), parseInt(month))
        const totalViews = dummyTimeline.reduce((sum, item) => sum + item.views, 0)
        const avgEngagement = dummyTimeline.reduce((sum, item) => sum + item.engagement, 0) / dummyTimeline.length
        const totalConversions = dummyTimeline.reduce((sum, item) => sum + item.conversions, 0)
        const totalClicks = Math.round(totalViews * 0.05) // 5% CTR
        const totalRevenue = totalConversions * 150 // $150 por conversión
        
        setStats({
          reach: { value: totalViews, change: 12.5, isPositive: true },
          engagement: { value: avgEngagement, change: 5.3, isPositive: true },
          clicks: { value: totalClicks, change: 8.2, isPositive: true },
          conversions: { value: totalConversions, change: 15.7, isPositive: true },
          ctr: { value: 5.0, change: 0, isPositive: true },
          revenue: { value: totalRevenue, change: 18.4, isPositive: true },
        })
      } else {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // En caso de error, generar stats dummy
      const dummyTimeline = generateDummyData(parseInt(year), parseInt(month))
      const totalViews = dummyTimeline.reduce((sum, item) => sum + item.views, 0)
      const avgEngagement = dummyTimeline.reduce((sum, item) => sum + item.engagement, 0) / dummyTimeline.length
      const totalConversions = dummyTimeline.reduce((sum, item) => sum + item.conversions, 0)
      const totalClicks = Math.round(totalViews * 0.05)
      const totalRevenue = totalConversions * 150
      
      setStats({
        reach: { value: totalViews, change: 12.5, isPositive: true },
        engagement: { value: avgEngagement, change: 5.3, isPositive: true },
        clicks: { value: totalClicks, change: 8.2, isPositive: true },
        conversions: { value: totalConversions, change: 15.7, isPositive: true },
        ctr: { value: 5.0, change: 0, isPositive: true },
        revenue: { value: totalRevenue, change: 18.4, isPositive: true },
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      const params = new URLSearchParams()
      
      // Calcular fechas basadas en año y mes
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      
      params.append('startDate', startDate.toISOString())
      params.append('endDate', endDate.toISOString())
      params.append('groupBy', 'day')
      
          // Agregar múltiples plataformas
          if (selectedPlatformIds.length > 0) {
            selectedPlatformIds.forEach((id) => {
              params.append('socialPlatformId', id.toString())
            })
          }
          if (influencerId && influencerId !== 'all') {
            params.append('influencerId', influencerId)
          }

      const res = await fetch(`/api/dashboard/timeline?${params.toString()}`)
      const data = await res.json()
      let timelineData = data.data || []
      
      // Si no hay datos, usar datos dummy
      if (timelineData.length === 0) {
        timelineData = generateDummyData(parseInt(year), parseInt(month))
        console.log('Using dummy data for timeline')
      }
      
      console.log('Timeline data:', timelineData) // Debug
      setTimeline(timelineData)
    } catch (error) {
      console.error('Error fetching timeline:', error)
      // En caso de error, usar datos dummy
      const dummyData = generateDummyData(parseInt(year), parseInt(month))
      setTimeline(dummyData)
    }
  }

  // Colores para cada plataforma
  const platformColors: Record<number, string> = {
    1: '#6C48C5', // TikTok - Púrpura
    2: '#E4405F', // Instagram - Rosa/Rojo
    3: '#FF0000', // YouTube - Rojo
    4: '#000000', // X - Negro
  }

  // Generar chartConfig dinámicamente basado en plataformas seleccionadas
  const chartConfig: ChartConfig = {
    views: {
      label: 'Vistas',
      color: '#6C48C5',
    },
    engagement: {
      label: 'Engagement',
      color: '#C68FFF',
    },
    conversions: {
      label: 'Conversiones',
      color: '#4CAF50',
    },
  }

  // Agregar configuraciones para cada plataforma seleccionada
  selectedPlatformIds.forEach((platformId) => {
    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      const color = platformColors[platformId] || '#6C48C5'
      chartConfig[`views_${platform.code}`] = {
        label: `Vistas ${platform.name}`,
        color,
      }
      chartConfig[`engagement_${platform.code}`] = {
        label: `Engagement ${platform.name}`,
        color,
      }
    }
  })

  // Formatear fecha para el eje X
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = months[date.getMonth()]?.label || ''
    return `${day}-${month.toLowerCase()}`
  }

  if (loading && !stats) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <p className="text-[#6B6B8D]">Cargando...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
              {/* Header con filtros */}
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-2">Dashboard</h1>
                  <p className="text-[16px] text-[#6B6B8D]">
                    Resumen general de métricas y rendimiento
                  </p>
                </div>
                
                {/* Filtros */}
                <div className="flex gap-4 flex-wrap">
                  {/* Año */}
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-[120px] rounded-2xl">
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

                  {/* Mes */}
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-[120px] rounded-2xl">
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

                  {/* Canal de ingreso (Redes sociales) - Multi-select */}
                  <Popover open={platformsOpen} onOpenChange={setPlatformsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[250px] justify-between rounded-2xl border-[rgba(108,72,197,0.1)]",
                          selectedPlatformIds.length === 0 && "text-muted-foreground"
                        )}
                      >
                        {selectedPlatformIds.length === 0
                          ? "Seleccionar canales"
                          : selectedPlatformIds.length === 1
                          ? platforms.find((p) => p.id === selectedPlatformIds[0])?.name || "1 canal seleccionado"
                          : `${selectedPlatformIds.length} canales seleccionados`}
                        <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-4 rounded-2xl">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-semibold text-[#1A1A2E]">Canales de ingreso</Label>
                          {selectedPlatformIds.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-[#6C48C5]"
                              onClick={() => setSelectedPlatformIds([])}
                            >
                              Limpiar
                            </Button>
                          )}
                        </div>
                        {platforms.length > 0 ? (
                          platforms.map((platform) => {
                            const isSelected = selectedPlatformIds.includes(platform.id)
                            return (
                              <div
                                key={platform.id}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[rgba(108,72,197,0.05)] cursor-pointer"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedPlatformIds(selectedPlatformIds.filter((id) => id !== platform.id))
                                  } else {
                                    setSelectedPlatformIds([...selectedPlatformIds, platform.id])
                                  }
                                }}
                              >
                                <Checkbox
                                  id={`platform-${platform.id}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPlatformIds([...selectedPlatformIds, platform.id])
                                    } else {
                                      setSelectedPlatformIds(selectedPlatformIds.filter((id) => id !== platform.id))
                                    }
                                  }}
                                  className="border-[#6C48C5] data-[state=checked]:bg-[#6C48C5]"
                                />
                                <Label
                                  htmlFor={`platform-${platform.id}`}
                                  className="flex-1 cursor-pointer text-sm text-[#1A1A2E] font-medium"
                                >
                                  {platform.name}
                                </Label>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-sm text-[#6B6B8D] py-2">Cargando plataformas...</div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Mostrar badges de plataformas seleccionadas */}
                  {selectedPlatformIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPlatformIds.map((platformId) => {
                        const platform = platforms.find((p) => p.id === platformId)
                        if (!platform) return null
                        return (
                          <div
                            key={platformId}
                            className="flex items-center gap-1 px-2 py-1 bg-[#E8DEFF] text-[#6C48C5] rounded-lg text-xs font-medium"
                          >
                            {platform.name}
                            <button
                              onClick={() => {
                                setSelectedPlatformIds(selectedPlatformIds.filter((id) => id !== platformId))
                              }}
                              className="ml-1 hover:bg-[#6C48C5] hover:text-white rounded-full p-0.5"
                            >
                              <IconX className="h-3 w-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Influencer */}
                  <Select value={influencerId} onValueChange={setInfluencerId}>
                    <SelectTrigger className="w-[200px] rounded-2xl">
                      <SelectValue placeholder="Influencer">
                        {influencerId === 'all' 
                          ? 'Todos los influencers' 
                          : influencers.find(i => i.id.toString() === influencerId)?.name || 'Influencer'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-[300px]">
                      <SelectItem value="all">Todos los influencers</SelectItem>
                      {influencers.length > 0 ? (
                        influencers.map((influencer) => (
                          <SelectItem key={influencer.id} value={influencer.id.toString()}>
                            {influencer.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Cargando influencers...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* KPIs Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-[14px] text-[#6B6B8D]">Alcance Total</CardDescription>
                      <CardTitle className="text-[24px] font-bold text-[#1A1A2E]">
                        {stats.reach.value.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {stats.reach.isPositive ? (
                          <IconTrendingUp className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <IconTrendingDown className="w-4 h-4 text-[#EF4444]" />
                        )}
                        <span className={`text-sm font-semibold ${stats.reach.isPositive ? 'text-[#4CAF50]' : 'text-[#EF4444]'}`}>
                          {stats.reach.change > 0 ? '+' : ''}{stats.reach.change.toFixed(1)}%
                        </span>
                        <span className="text-sm text-[#6B6B8D]">vs mes anterior</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-[14px] text-[#6B6B8D]">Engagement Rate</CardDescription>
                      <CardTitle className="text-[24px] font-bold text-[#1A1A2E]">
                        {stats.engagement.value.toFixed(2)}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {stats.engagement.isPositive ? (
                          <IconTrendingUp className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <IconTrendingDown className="w-4 h-4 text-[#EF4444]" />
                        )}
                        <span className={`text-sm font-semibold ${stats.engagement.isPositive ? 'text-[#4CAF50]' : 'text-[#EF4444]'}`}>
                          {stats.engagement.change > 0 ? '+' : ''}{stats.engagement.change.toFixed(1)}%
                        </span>
                        <span className="text-sm text-[#6B6B8D]">vs mes anterior</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-[14px] text-[#6B6B8D]">Conversiones</CardDescription>
                      <CardTitle className="text-[24px] font-bold text-[#1A1A2E]">
                        {stats.conversions.value.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {stats.conversions.isPositive ? (
                          <IconTrendingUp className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <IconTrendingDown className="w-4 h-4 text-[#EF4444]" />
                        )}
                        <span className={`text-sm font-semibold ${stats.conversions.isPositive ? 'text-[#4CAF50]' : 'text-[#EF4444]'}`}>
                          {stats.conversions.change > 0 ? '+' : ''}{stats.conversions.change.toFixed(1)}%
                        </span>
                        <span className="text-sm text-[#6B6B8D]">vs mes anterior</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Gráfico principal */}
              <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">Evolución Temporal</CardTitle>
                  <CardDescription className="text-[14px] text-[#6B6B8D]">
                    Vistas, Engagement y Conversiones por día - {months[parseInt(month) - 1]?.label} {year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                  {timeline.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-[#6B6B8D]">
                      <p>No hay datos disponibles para el período seleccionado</p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={chartConfig}
                      className="aspect-auto h-[400px] w-full"
                    >
                      {selectedPlatformIds.length > 1 ? (
                        // Gráfico de líneas comparativo cuando hay múltiples plataformas
                        <LineChart
                          data={timeline}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            {selectedPlatformIds.map((platformId) => {
                              const platform = platforms.find((p) => p.id === platformId)
                              if (!platform) return null
                              const color = platformColors[platformId] || '#6C48C5'
                              return (
                                <linearGradient key={`gradient_${platform.code}`} id={`fill_${platform.code}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                </linearGradient>
                              )
                            })}
                          </defs>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E8DEFF" />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fill: '#6B6B8D', fontSize: 12 }}
                            tickFormatter={(value) => formatDate(value)}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6B6B8D', fontSize: 12 }}
                            tickFormatter={(value) => {
                              if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}k`
                              }
                              return value.toString()
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  return formatDate(value as string)
                                }}
                                indicator="dot"
                              />
                            }
                          />
                          <Legend />
                          {selectedPlatformIds.map((platformId) => {
                            const platform = platforms.find((p) => p.id === platformId)
                            if (!platform) return null
                            const color = platformColors[platformId] || '#6C48C5'
                            return (
                              <Line
                                key={`views_${platform.code}`}
                                dataKey={`views_${platform.code}`}
                                type="monotone"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                name={platform.name}
                              />
                            )
                          })}
                        </LineChart>
                      ) : (
                        // Gráfico de áreas normal cuando hay una sola plataforma o todas
                        <AreaChart
                          data={timeline}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C48C5" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#6C48C5" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillEngagement" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C68FFF" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#C68FFF" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E8DEFF" />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fill: '#6B6B8D', fontSize: 12 }}
                            tickFormatter={(value) => formatDate(value)}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6B6B8D', fontSize: 12 }}
                            tickFormatter={(value) => {
                              if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}k`
                              }
                              return value.toString()
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  return formatDate(value as string)
                                }}
                                indicator="dot"
                              />
                            }
                          />
                          <Area
                            dataKey="views"
                            type="monotone"
                            fill="url(#fillViews)"
                            stroke="#6C48C5"
                            strokeWidth={2}
                            fillOpacity={0.6}
                          />
                          <Area
                            dataKey="engagement"
                            type="monotone"
                            fill="url(#fillEngagement)"
                            stroke="#C68FFF"
                            strokeWidth={2}
                            fillOpacity={0.6}
                          />
                          <Area
                            dataKey="conversions"
                            type="monotone"
                            fill="url(#fillConversions)"
                            stroke="#4CAF50"
                            strokeWidth={2}
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      )}
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
