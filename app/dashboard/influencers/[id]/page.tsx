'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { PageBreadcrumb } from '@/components/page-breadcrumb'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { InfluencerWithRelations } from '@/shared/types/influencer.types'

interface ScrapedVideo {
  id: string
  desc: string
  views: number
  likes: number
  comments: number
  saves: number
  duration: number
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
    avatar_url?: string
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

const DUMMY_INFLUENCER: InfluencerWithRelations = {
  id: 1,
  name: 'Influencer demo',
  email: 'demo@takenos.com',
  birthDate: null,
  niche: 'Creador de contenido',
  referralCode: 'DEMO2025',
  createdAt: new Date(),
  updatedAt: new Date(),
  socialAccounts: [],
  influencerCampaigns: [],
  posts: [],
  _count: {
    posts: 3,
    influencerCampaigns: 2,
  },
}

const DUMMY_SCRAPED: ScrapedResponse = {
  success: true,
  message: 'Datos de ejemplo (dummy) para la vista de detalle.',
  timestamp: new Date().toISOString(),
  data: {
    profile: {
      username: 'demo.influencer',
      avatar_url: '/profile.png',
      followers: 1250,
      following: 340,
      likes: 9800,
      engagement_median: 0.054,
      engagement_range: { low: 0.04, high: 0.07 },
    },
    statistics: {
      total_videos: 10,
      median_engagement: 0.054,
      average_engagement: 0.058,
      totals: {
        views: '85000',
        likes: '5200',
        comments: '340',
      },
    },
    top_videos: {
      most_saved: {
        id: 'vid-dummy-3',
        desc: 'Tutorial rápido que los usuarios guardan para ver después.',
        views: 12000,
        likes: 850,
        comments: 40,
        saves: 320,
        duration: 35,
        engagement_rate: 0.097,
        engagement_level: 'top',
        percentile: '92.00',
        score_100: 88,
        is_most_viewed: 0,
        is_most_saved: 1,
        is_highest_engagement: 0,
        is_top_percentile: 1,
      },
      most_viewed: {
        id: 'vid-dummy-1',
        desc: 'Video principal de campaña con mayor alcance.',
        views: 25000,
        likes: 1100,
        comments: 60,
        saves: 180,
        duration: 28,
        engagement_rate: 0.044,
        engagement_level: 'estándar',
        percentile: '55.00',
        score_100: 70,
        is_most_viewed: 1,
        is_most_saved: 0,
        is_highest_engagement: 0,
        is_top_percentile: 0,
      },
      highest_engagement: {
        id: 'vid-dummy-2',
        desc: 'Contenido con mejor engagement relativo.',
        views: 8000,
        likes: 900,
        comments: 50,
        saves: 140,
        duration: 22,
        engagement_rate: 0.136,
        engagement_level: 'top',
        percentile: '96.00',
        score_100: 100,
        is_most_viewed: 0,
        is_most_saved: 0,
        is_highest_engagement: 1,
        is_top_percentile: 1,
      },
    },
    videos: [],
    scraped_at: new Date().toISOString(),
  },
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const id = Number(params?.id)

  const [influencer, setInfluencer] = useState<InfluencerWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  const [scraped, setScraped] = useState<ScrapedResponse | null>(null)
  const [scrapeLoading, setScrapeLoading] = useState(false)

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    fetchInfluencer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchInfluencer = async () => {
    try {
      const res = await fetch(`/api/influencers/${id}`)
      if (!res.ok) {
        // Modo dummy si la API devuelve error o 404
        setInfluencer(DUMMY_INFLUENCER)
        setScraped(DUMMY_SCRAPED)
        return
      }

      const data = await res.json()
      const item = (data.data || null) as InfluencerWithRelations | null
      setInfluencer(item)

      if (item) {
        fetchScrapedData(item)
      }
    } catch (error) {
      console.error('Error fetching influencer detail:', error)
      // Modo dummy en caso de error
      setInfluencer(DUMMY_INFLUENCER)
      setScraped(DUMMY_SCRAPED)
    } finally {
      setLoading(false)
    }
  }

  const fetchScrapedData = async (item: InfluencerWithRelations) => {
    try {
      setScrapeLoading(true)

      // Obtener handle de TikTok si existe, si no, usar el nombre como fallback
      const tiktokAccount = item.socialAccounts?.find(
        (acc) => acc.socialPlatform.code.toLowerCase() === 'tiktok',
      )

      const value =
        tiktokAccount && tiktokAccount.handle
          ? `@${tiktokAccount.handle.replace(/^@/, '')}`
          : `@${item.name.replace(/\s+/g, '').toLowerCase()}`

      const res = await fetch('/api/scraping/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: value,
        }),
      })

      if (!res.ok) return

      const data = await res.json()
      // El endpoint devuelve el objeto de scraping completo en la raíz:
      // { success, data: { profile, statistics, top_videos, videos }, message, timestamp }
      setScraped(data as ScrapedResponse)
    } catch (error) {
      console.error('Error fetching scraped data:', error)
      setScraped(null)
    } finally {
      setScrapeLoading(false)
    }
  }

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(num)) return '-'
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toLocaleString('es-ES')
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

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
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <PageBreadcrumb />
                  <h1 className="text-[24px] font-bold text-[#1A1A2E] mb-1">
                    {influencer ? influencer.name : 'Influencer demo'}
                  </h1>
                  <p className="text-[14px] text-[#6B6B8D]">
                    Ficha rápida del influencer y resumen de su impacto en TikTok.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-[#6B6B8D]">Cargando...</div>
              ) : !influencer ? (
                <div className="text-center py-12 text-[#6B6B8D]">
                  No se encontró el influencer.
                </div>
              ) : (
                <Tabs defaultValue="details" className="mt-2">
                  <TabsList>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Información básica + redes */}
                      <Card className="rounded-[20px] border-[rgba(108,72,197,0.06)] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Ficha del influencer
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Resumen de los mismos campos que ves en la tabla principal.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Nombre</p>
                          <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                            {influencer.name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Nicho</p>
                          <p className="text-sm text-[#1A1A2E] truncate">
                            {influencer.niche || <span className="text-[#6B6B8D]">No definido</span>}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Código referido</p>
                          <p className="text-sm text-[#1A1A2E]">
                            {influencer.referralCode || (
                              <span className="text-[#6B6B8D]">No definido</span>
                            )}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Campañas</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {influencer._count?.influencerCampaigns ?? 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Posts</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {influencer._count?.posts ?? 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-xs text-[#6B6B8D]">Email</p>
                          <p className="text-sm text-[#1A1A2E] truncate">
                            {influencer.email || <span className="text-[#6B6B8D]">No definido</span>}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[rgba(108,72,197,0.08)] mt-1">
                        <p className="text-xs text-[#6B6B8D] mb-2">Redes sociales</p>
                        {influencer.socialAccounts && influencer.socialAccounts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {influencer.socialAccounts.map((account) => (
                              <Badge key={account.id} variant="outline" className="text-xs rounded-2xl">
                                {account.socialPlatform.name}
                                {account.handle && ` · @${account.handle.replace(/^@/, '')}`}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#9CA3AF]">
                            No hay redes sociales registradas para este influencer.
                          </p>
                        )}
                      </div>
                    </CardContent>
                      </Card>

                      {/* TikTok: perfil y resumen de rendimiento */}
                      <Card className="rounded-[20px] border-[rgba(108,72,197,0.06)] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        TikTok (scraping)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Perfil y engagement promedio en TikTok.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {scrapeLoading ? (
                        <p className="text-xs text-[#6B6B8D]">Cargando datos simulados...</p>
                      ) : !scraped ? (
                        <p className="text-xs text-[#6B6B8D]">
                          No se pudieron obtener los datos simulados de TikTok.
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={scraped.data.profile.avatar_url}
                                  alt={scraped.data.profile.username}
                                />
                                <AvatarFallback className="text-xs">
                                  {scraped.data.profile.username
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs text-[#6B6B8D] mb-0.5">Usuario</p>
                                <p className="text-sm font-semibold text-[#1A1A2E]">
                                  @{scraped.data.profile.username}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-[#E8DEFF] text-[#6C48C5] text-xs px-2 py-0.5">
                              Datos en vivo
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <p className="text-xs text-[#6B6B8D] mb-1">Seguidores</p>
                              <p className="text-sm font-semibold text-[#1A1A2E]">
                                {formatNumber(scraped.data.profile.followers)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#6B6B8D] mb-1">Seguidos</p>
                              <p className="text-sm font-semibold text-[#1A1A2E]">
                                {formatNumber(scraped.data.profile.following)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#6B6B8D] mb-1">Likes totales</p>
                              <p className="text-sm font-semibold text-[#1A1A2E]">
                                {formatNumber(scraped.data.profile.likes)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#6B6B8D] mb-1">
                                Engagement medio (mediana)
                              </p>
                              <p className="text-sm font-semibold text-[#1A1A2E]">
                                {formatPercent(scraped.data.profile.engagement_median)}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[rgba(108,72,197,0.08)] mt-2">
                            <p className="text-xs text-[#6B6B8D] mb-1">
                              Rango de engagement estimado
                            </p>
                            <p className="text-sm font-semibold text-[#1A1A2E]">
                              {formatPercent(scraped.data.profile.engagement_range.low)} –{' '}
                              {formatPercent(scraped.data.profile.engagement_range.high)}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[rgba(108,72,197,0.08)] mt-2 space-y-2">
                            <p className="text-xs text-[#6B6B8D]">
                              Resumen de contenido (últimos {scraped.data.statistics.total_videos}{' '}
                              videos)
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <p className="text-[10px] text-[#6B6B8D] mb-1">Vistas totales</p>
                                <p className="text-sm font-semibold text-[#1A1A2E]">
                                  {formatNumber(scraped.data.statistics.totals.views)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B6B8D] mb-1">Likes totales</p>
                                <p className="text-sm font-semibold text-[#1A1A2E]">
                                  {formatNumber(scraped.data.statistics.totals.likes)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B6B8D] mb-1">Comentarios</p>
                                <p className="text-sm font-semibold text-[#1A1A2E]">
                                  {formatNumber(scraped.data.statistics.totals.comments)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="posts" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Top videos (resumen compacto) */}
                      <Card className="lg:col-span-2 rounded-[20px] border-[rgba(108,72,197,0.06)] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Top videos en TikTok
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Tres videos clave: más visto, mejor engagement y más guardado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {scrapeLoading ? (
                        <p className="text-xs text-[#6B6B8D]">Cargando datos simulados...</p>
                      ) : !scraped ? (
                        <p className="text-xs text-[#6B6B8D]">
                          No hay datos simulados para mostrar los top videos.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {([
                            {
                              key: 'most_viewed',
                              label: 'Más visto',
                              video: scraped.data.top_videos.most_viewed,
                            },
                            {
                              key: 'highest_engagement',
                              label: 'Mayor engagement',
                              video: scraped.data.top_videos.highest_engagement,
                            },
                            {
                              key: 'most_saved',
                              label: 'Más guardado',
                              video: scraped.data.top_videos.most_saved,
                            },
                          ] as const).map(({ key, label, video }) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-[rgba(108,72,197,0.03)] flex flex-col gap-2"
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
                              <p className="text-xs text-[#6B6B8D] line-clamp-3 min-h-[2.5rem]">
                                {video.desc || 'Sin descripción'}
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-[10px]">
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
                        </div>
                      )}
                    </CardContent>
                      </Card>

                      {/* Videos y comentarios (vista compacta para marketing) */}
                      <Card className="lg:col-span-2 rounded-[20px] border-[rgba(108,72,197,0.06)] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Videos y preguntas de la comunidad
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Lista resumida de videos para que el equipo de marketing identifique dónde hay
                        más conversación.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {scrapeLoading ? (
                        <p className="text-xs text-[#6B6B8D]">Cargando videos...</p>
                      ) : !scraped || scraped.data.videos.length === 0 ? (
                        <p className="text-xs text-[#6B6B8D]">
                          Todavía no hay videos disponibles para analizar comentarios.
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-5 gap-2 text-[11px] text-[#9CA3AF]">
                            <span>Video</span>
                            <span>Vistas</span>
                            <span>Comentarios</span>
                            <span>Engagement</span>
                            <span>Acción</span>
                          </div>
                          <div className="space-y-2">
                            {scraped.data.videos.map((video) => (
                              <div
                                key={video.id}
                                className="grid grid-cols-5 gap-2 items-start rounded-xl bg-[rgba(108,72,197,0.02)] px-3 py-2"
                              >
                                <div className="pr-2">
                                  <p className="text-xs font-medium text-[#1A1A2E] truncate">
                                    {video.desc || 'Sin descripción'}
                                  </p>
                                  <p className="text-[11px] text-[#9CA3AF]">
                                    ID: <span className="font-mono">{video.id.slice(0, 8)}...</span>
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-[#1A1A2E]">
                                  {formatNumber(video.views)}
                                </p>
                                <p className="text-xs font-semibold text-[#1A1A2E]">
                                  {video.comments.toLocaleString('es-ES')}
                                </p>
                                <div className="flex flex-col gap-0.5 items-start">
                                  <span className="text-xs font-semibold text-[#1A1A2E]">
                                    {formatPercent(video.engagement_rate)}
                                  </span>
                                  <span className="text-[11px] text-[#6B6B8D]">
                                    Nivel {video.engagement_level}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] rounded-2xl"
                                    onClick={() => {
                                      // Placeholder: aquí en un futuro se podrán cargar comentarios reales
                                      console.log(
                                        '[Comentarios dummy] Ver comentarios para video',
                                        video.id
                                      )
                                    }}
                                  >
                                    Ver comentarios
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] pt-1">
                            En una siguiente versión podrás ver aquí las preguntas más frecuentes y un
                            resumen automático para el equipo de marketing.
                          </p>
                        </>
                      )}
                    </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


