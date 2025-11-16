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
      const data = await res.json()
      const item = (data.data || null) as InfluencerWithRelations | null
      setInfluencer(item)

      if (item) {
        fetchScrapedData(item)
      }
    } catch (error) {
      console.error('Error fetching influencer detail:', error)
      setInfluencer(null)
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
      // El endpoint devuelve { message, data: mocked }
      setScraped(data.data as ScrapedResponse)
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
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <PageBreadcrumb />
                  <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-1">
                    {influencer ? influencer.name : 'Influencer'}
                  </h1>
                  <p className="text-[16px] text-[#6B6B8D]">
                    Detalle del influencer y simulación de datos de TikTok
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información básica */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Información básica
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Datos registrados en la plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-[#6B6B8D] mb-1">Nombre</p>
                        <p className="font-semibold text-[#1A1A2E]">{influencer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B8D] mb-1">Email</p>
                        <p className="text-[#1A1A2E]">
                          {influencer.email || <span className="text-[#6B6B8D]">No definido</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B8D] mb-1">Nicho</p>
                        <p className="text-[#1A1A2E]">
                          {influencer.niche || <span className="text-[#6B6B8D]">No definido</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B6B8D] mb-1">Código de referido</p>
                        <p className="text-[#1A1A2E]">
                          {influencer.referralCode || (
                            <span className="text-[#6B6B8D]">No definido</span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Campañas</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {influencer._count?.influencerCampaigns ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B6B8D] mb-1">Posts</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">
                            {influencer._count?.posts ?? 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Redes sociales */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Redes sociales
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Cuentas enlazadas al influencer
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {influencer.socialAccounts && influencer.socialAccounts.length > 0 ? (
                        influencer.socialAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[rgba(108,72,197,0.03)]"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs text-[#6B6B8D]">
                                {account.socialPlatform.name}
                              </span>
                              <span className="text-sm font-medium text-[#1A1A2E]">
                                @{account.handle.replace(/^@/, '')}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                account.isActive
                                  ? 'text-xs bg-[#E8F5E9] text-[#4CAF50] px-2 py-0.5'
                                  : 'text-xs bg-[#FFEBEE] text-[#EF4444] px-2 py-0.5'
                              }
                            >
                              {account.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#6B6B8D]">
                          No hay redes sociales registradas para este influencer.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Simulación TikTok */}
                  <Card className="lg:col-span-1 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        TikTok (simulación)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Datos simulados de perfil y rendimiento en TikTok
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
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-[#6B6B8D] mb-1">Usuario</p>
                              <p className="text-sm font-semibold text-[#1A1A2E]">
                                @{scraped.data.profile.username}
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

                          <div className="pt-3 border-t border-[rgba(108,72,197,0.1)] mt-2">
                            <p className="text-xs text-[#6B6B8D] mb-1">
                              Rango de engagement estimado
                            </p>
                            <p className="text-sm font-semibold text-[#1A1A2E]">
                              {formatPercent(scraped.data.profile.engagement_range.low)} –{' '}
                              {formatPercent(scraped.data.profile.engagement_range.high)}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[rgba(108,72,197,0.1)] mt-2 space-y-2">
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

                  {/* Top videos (simulación) */}
                  <Card className="lg:col-span-3 rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-[18px] font-bold text-[#1A1A2E]">
                        Top videos en TikTok (simulación)
                      </CardTitle>
                      <CardDescription className="text-[14px] text-[#6B6B8D]">
                        Videos destacados según vistas, guardados y engagement
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
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


