'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconSearch } from '@tabler/icons-react'

interface ScrapedVideo {
  id: string
  desc: string
  create_time?: number
  views: number
  likes: number
  comments: number
  saves: number
  duration: number
  hashtags: string[]
  engagement_rate: number
  engagement_level: string
  percentile: string
  score_100: number
  is_most_viewed: number
  is_most_saved: number
  is_highest_engagement: number
  is_top_percentile: number
}

interface ScrapedProfileData {
  profile: {
    username: string
    followers: number
    following: number
    likes: number
    engagement_median: number
    engagement_range: { low: number; high: number }
  }
  statistics: {
    total_videos: number
    median_engagement: number
    average_engagement: number
    totals: {
      views: string
      likes: string
      comments: string
    }
  }
  top_videos: {
    most_saved: ScrapedVideo
    most_viewed: ScrapedVideo
    highest_engagement: ScrapedVideo
  }
  videos: ScrapedVideo[]
  scraped_at: string
}

interface ScrapedResponse {
  success: boolean
  data: ScrapedProfileData
  message: string
  timestamp: string
}

export default function InfluencerSimulationPage() {
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScrapedResponse | null>(null)
  const [backendHealth, setBackendHealth] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Ingresa un nombre de usuario.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/scraping/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmed,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al obtener la simulación.')
        setResult(null)
        setBackendHealth(null)
        return
      }

      setResult(data.data as ScrapedResponse)
      setBackendHealth((data.backendHealth as Record<string, unknown>) ?? null)
    } catch (err) {
      console.error('Error simulando importación:', err)
      setError('Ocurrió un error al obtener los datos simulados.')
      setResult(null)
      setBackendHealth(null)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(num)) return '-'
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toLocaleString('es-ES')
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  const formatDateTime = (value: string) => {
    if (!value) return '-'
    const d = new Date(value)
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatUnixToDate = (ts: number) => {
    if (!ts) return '-'
    return new Date(ts * 1000).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
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
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-1">
                    Simulación de datos de influencer
                  </h1>
                  <p className="text-[16px] text-[#6B6B8D]">
                    Visualiza toda la información que devuelve el JSON de scraping (perfil, estadísticas, top videos y lista completa de videos).
                  </p>
                </div>
              </div>

              {/* Formulario de simulación */}
              <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                <CardHeader>
                  <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                    Parámetros de importación simulada
                  </CardTitle>
                  <CardDescription className="text-[14px] text-[#6B6B8D]">
                    Ingresa un usuario o enlace de perfil para probar la simulación. El backend devolverá siempre el JSON de ejemplo, ajustando solo el nombre de usuario.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[14px] font-semibold text-[#1A1A2E] mb-2 block">
                        Plataforma
                      </Label>
                      <Select
                        value={platform}
                        onValueChange={(val) => setPlatform(val as 'tiktok' | 'instagram')}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-[14px] font-semibold text-[#1A1A2E] mb-2 block">
                        Usuario o enlace de perfil
                      </Label>
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B8D]" />
                        <Input
                          className="pl-9 rounded-2xl"
                          placeholder="@usuario o https://..."
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-[#6B6B8D] mt-2">
                        Ejemplos: <span className="font-mono">@maria.beauty</span> o{' '}
                        <span className="font-mono">https://www.tiktok.com/@maria.beauty</span>
                      </p>
                    </div>
                  </div>
                  {error && (
                    <p className="text-xs text-[#EF4444]">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSimulate}
                      disabled={loading}
                      className="bg-gradient-to-r from-[#8B6FD9] to-[#6C48C5] text-white rounded-2xl px-6"
                    >
                      {loading ? 'Obteniendo datos...' : 'Ver datos simulados'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Estado del backend (healthcheck) */}
                  {backendHealth && (
                    <Card className="lg:col-span-3 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_2px_10px_rgba(108,72,197,0.06)]">
                      <CardHeader>
                        <CardTitle className="text-[16px] font-bold text-[#1A1A2E]">
                          API backend /health
                        </CardTitle>
                        <CardDescription className="text-[13px] text-[#6B6B8D]">
                          Respuesta cruda desde <span className="font-mono">http://localhost:3001/health</span>.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-[11px] bg-[#0F172A]/90 text-[#E5E7EB] rounded-xl p-3 overflow-x-auto">
                          {JSON.stringify(backendHealth, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {/* Perfil y estadísticas generales */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Perfil (JSON)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Datos básicos del perfil en la red social
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Usuario</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            @{result.data.profile.username}
                          </p>
                        </div>
                        <Badge className="bg-[#E8DEFF] text-[#6C48C5] text-xs px-2 py-0.5">
                          Simulación
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Seguidores</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.profile.followers)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Siguiendo</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.profile.following)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Likes totales</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.profile.likes)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Engagement mediano</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatPercent(result.data.profile.engagement_median)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[rgba(108,72,197,0.1)] mt-2">
                        <p className="text-xs text-[#6B6B8D] mb-1">Rango de engagement</p>
                        <p className="text-sm font-semibold text-[#1A1A2E]">
                          {formatPercent(result.data.profile.engagement_range.low)} –{' '}
                          {formatPercent(result.data.profile.engagement_range.high)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[rgba(108,72,197,0.1)] mt-2 space-y-2">
                        <p className="text-xs text-[#6B6B8D]">Resumen del JSON</p>
                        <p className="text-[11px] text-[#6B6B8D]">
                          Scraped at:{' '}
                          <span className="font-mono">
                            {formatDateTime(result.data.scraped_at)}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#6B6B8D]">
                          Timestamp:{' '}
                          <span className="font-mono">
                            {formatDateTime(result.timestamp)}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estadísticas agregadas */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Estadísticas agregadas
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Datos agregados que vienen dentro de <span className="font-mono">statistics</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Total de videos</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {result.data.statistics.total_videos}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Engagement mediano</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatPercent(result.data.statistics.median_engagement)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Engagement promedio</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatPercent(result.data.statistics.average_engagement)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[rgba(108,72,197,0.1)] mt-2">
                        <div>
                          <p className="text-[11px] text-[#6B6B8D] mb-1">Vistas totales</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.statistics.totals.views)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#6B6B8D] mb-1">Likes totales</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.statistics.totals.likes)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#6B6B8D] mb-1">Comentarios</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {formatNumber(result.data.statistics.totals.comments)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top videos */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Top videos (JSON)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Objetos <span className="font-mono">top_videos.most_viewed</span>,{' '}
                        <span className="font-mono">highest_engagement</span> y{' '}
                        <span className="font-mono">most_saved</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {([
                        {
                          label: 'Más visto',
                          video: result.data.top_videos.most_viewed,
                        },
                        {
                          label: 'Mayor engagement',
                          video: result.data.top_videos.highest_engagement,
                        },
                        {
                          label: 'Más guardado',
                          video: result.data.top_videos.most_saved,
                        },
                      ] as const).map(({ label, video }) => (
                        <div
                          key={video.id}
                          className="p-2 rounded-lg bg-[rgba(108,72,197,0.03)] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#1A1A2E]">
                              {label}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-[#E8DEFF] text-[#6C48C5] px-2 py-0.5"
                            >
                              Score {video.score_100}/100
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#6B6B8D] line-clamp-2">
                            {video.desc || 'Sin descripción'}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-[10px] mt-1">
                            <div>
                              <p className="text-[#6B6B8D]">Vistas</p>
                              <p className="font-semibold text-[#1A1A2E]">
                                {formatNumber(video.views)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6B6B8D]">Engagement</p>
                              <p className="font-semibold text-[#1A1A2E]">
                                {formatPercent(video.engagement_rate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6B6B8D]">Nivel</p>
                              <p className="font-semibold text-[#1A1A2E]">
                                {video.engagement_level}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Tabla completa de videos */}
                  <Card className="lg:col-span-3 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Lista completa de videos (JSON)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Todos los elementos del array <span className="font-mono">videos[]</span>.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.data.videos.length === 0 ? (
                        <p className="text-xs text-[#6B6B8D]">
                          No hay videos en el JSON.
                        </p>
                      ) : (
                        <div className="w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-[rgba(108,72,197,0.1)]">
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  ID
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Fecha
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Descripción
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Vistas
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Likes
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Comentarios
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Guardados
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Engagement
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Nivel
                                </TableHead>
                                <TableHead className="text-[#1A1A2E] font-semibold">
                                  Tags
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.data.videos.map((video) => (
                                <TableRow
                                  key={video.id}
                                  className="border-[rgba(108,72,197,0.1)] hover:bg-[#F8F7FC]"
                                >
                                  <TableCell className="text-xs font-mono text-[#6B6B8D] max-w-[140px] truncate">
                                    {video.id}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#6B6B8D]">
                                    {formatUnixToDate(video.create_time || 0)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E] max-w-[260px] truncate">
                                    {video.desc || 'Sin descripción'}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {formatNumber(video.views)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {formatNumber(video.likes)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {formatNumber(video.comments)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {formatNumber(video.saves)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {formatPercent(video.engagement_rate)}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#1A1A2E]">
                                    {video.engagement_level}
                                  </TableCell>
                                  <TableCell className="text-xs text-[#6B6B8D] max-w-[200px]">
                                    {video.hashtags && video.hashtags.length > 0
                                      ? video.hashtags.join(', ')
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


