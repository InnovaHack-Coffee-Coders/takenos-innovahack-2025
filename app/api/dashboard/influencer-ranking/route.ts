import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aggregateMetrics, calculateROI } from '@/lib/metrics'

interface InfluencerRanking {
  id: number
  name: string
  email: string | null
  niche: string | null
  rank: number
  totalViews: number
  totalEngagement: number
  totalConversions: number
  totalRevenue: number
  engagementRate: number
  roi: number
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const socialPlatformId = searchParams.get('socialPlatformId')
  const limit = parseInt(searchParams.get('limit') || '10')

  const baseDummyRankings: InfluencerRanking[] = [
    {
      id: 1,
      name: 'María García',
      email: 'maria@example.com',
      niche: 'Beauty & Lifestyle',
      rank: 1,
      totalViews: 450000,
      totalEngagement: 7.5,
      totalConversions: 1250,
      totalRevenue: 187500,
      engagementRate: 7.5,
      roi: 68.5,
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      niche: 'Tech & Gadgets',
      rank: 2,
      totalViews: 380000,
      totalEngagement: 6.8,
      totalConversions: 1050,
      totalRevenue: 157500,
      engagementRate: 6.8,
      roi: 55.2,
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana@example.com',
      niche: 'Fitness & Wellness',
      rank: 3,
      totalViews: 320000,
      totalEngagement: 8.2,
      totalConversions: 980,
      totalRevenue: 147000,
      engagementRate: 8.2,
      roi: 62.3,
    },
    {
      id: 4,
      name: 'Luis Fernández',
      email: 'luis@example.com',
      niche: 'Travel & Adventure',
      rank: 4,
      totalViews: 290000,
      totalEngagement: 6.5,
      totalConversions: 850,
      totalRevenue: 127500,
      engagementRate: 6.5,
      roi: 48.7,
    },
    {
      id: 5,
      name: 'Sofia Pérez',
      email: 'sofia@example.com',
      niche: 'Fashion & Style',
      rank: 5,
      totalViews: 270000,
      totalEngagement: 7.1,
      totalConversions: 780,
      totalRevenue: 117000,
      engagementRate: 7.1,
      roi: 52.4,
    },
  ]

  // Si no hay DATABASE_URL, devolver siempre ranking dummy (modo demo)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: baseDummyRankings.slice(0, limit) })
  }

  try {

    // Construir filtros
    interface PostWhere {
      socialPlatformId?: number
      OR?: Array<{ socialPlatformId: number }>
    }

    const postWhere: PostWhere = {}

    if (socialPlatformId) {
      const platformIds = socialPlatformId.split(',').map((id) => parseInt(id)).filter(id => !isNaN(id))
      if (platformIds.length === 1) {
        postWhere.socialPlatformId = platformIds[0]
      } else if (platformIds.length > 1) {
        // Usar OR para múltiples plataformas
        postWhere.OR = platformIds.map(id => ({ socialPlatformId: id }))
      }
    }

    interface MetricWhere {
      post: PostWhere
      snapshotDate?: {
        gte?: Date
        lte?: Date
      }
    }

    const metricWhere: MetricWhere = {
      post: postWhere,
    }

    if (startDate || endDate) {
      metricWhere.snapshotDate = {}
      if (startDate) {
        metricWhere.snapshotDate.gte = new Date(startDate)
      }
      if (endDate) {
        metricWhere.snapshotDate.lte = new Date(endDate)
      }
    }

    // Obtener influencers con sus métricas
    const influencers = await prisma.influencer.findMany({
      include: {
        posts: {
          include: {
            metrics: {
              where: metricWhere,
            },
          },
        },
        influencerCampaigns: {
          include: {
            campaign: true,
          },
        },
      },
    })

    // Calcular ranking
    const rankings: InfluencerRanking[] = influencers
      .map((influencer) => {
        // Obtener todos los snapshots de métricas del influencer
        const allMetrics = influencer.posts.flatMap((post) => post.metrics)

        // Si hay filtro por plataforma múltiple, filtrar
        if (socialPlatformId && socialPlatformId.includes(',')) {
          const platformIds = socialPlatformId.split(',').map((id) => parseInt(id))
          const filteredPosts = influencer.posts.filter((post) =>
            platformIds.includes(post.socialPlatformId)
          )
          const filteredMetrics = filteredPosts.flatMap((post) => post.metrics)
          return { ...influencer, posts: filteredPosts, allMetrics: filteredMetrics }
        }

        return { ...influencer, allMetrics }
      })
      .map((influencer) => {
        if (!influencer.allMetrics || influencer.allMetrics.length === 0) {
          return null
        }

        const aggregated = aggregateMetrics(influencer.allMetrics)

        // Calcular costo total del influencer (suma de agreedCost en campañas)
        const totalCost = influencer.influencerCampaigns.reduce(
          (sum, ic) => sum + (ic.agreedCost ? Number(ic.agreedCost) : 0),
          0
        )

        const roi = calculateROI(aggregated.total.revenue, totalCost || 1)

        return {
          id: influencer.id,
          name: influencer.name,
          email: influencer.email,
          niche: influencer.niche,
          rank: 0, // Se asignará después del sort
          totalViews: aggregated.total.views,
          totalEngagement: aggregated.engagementRate,
          totalConversions: aggregated.total.conversions,
          totalRevenue: aggregated.total.revenue,
          engagementRate: aggregated.engagementRate,
          roi,
        }
      })
      .filter((item): item is InfluencerRanking => item !== null)
      .sort((a, b) => {
        // Ordenar por una combinación de métricas (puntuación compuesta)
        const scoreA = a.totalViews * 0.3 + a.engagementRate * 100 + a.totalConversions * 10
        const scoreB = b.totalViews * 0.3 + b.engagementRate * 100 + b.totalConversions * 10
        return scoreB - scoreA
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }))
      .slice(0, limit)

    // Si no hay datos, generar datos dummy
    if (rankings.length === 0) {
      const dummyRankings: InfluencerRanking[] = [
        {
          id: 1,
          name: 'María García',
          email: 'maria@example.com',
          niche: 'Beauty & Lifestyle',
          rank: 1,
          totalViews: 450000,
          totalEngagement: 7.5,
          totalConversions: 1250,
          totalRevenue: 187500,
          engagementRate: 7.5,
          roi: 68.5,
        },
        {
          id: 2,
          name: 'Carlos Rodríguez',
          email: 'carlos@example.com',
          niche: 'Tech & Gadgets',
          rank: 2,
          totalViews: 380000,
          totalEngagement: 6.8,
          totalConversions: 1050,
          totalRevenue: 157500,
          engagementRate: 6.8,
          roi: 55.2,
        },
        {
          id: 3,
          name: 'Ana Martínez',
          email: 'ana@example.com',
          niche: 'Fitness & Wellness',
          rank: 3,
          totalViews: 320000,
          totalEngagement: 8.2,
          totalConversions: 980,
          totalRevenue: 147000,
          engagementRate: 8.2,
          roi: 62.3,
        },
        {
          id: 4,
          name: 'Luis Fernández',
          email: 'luis@example.com',
          niche: 'Travel & Adventure',
          rank: 4,
          totalViews: 290000,
          totalEngagement: 6.5,
          totalConversions: 850,
          totalRevenue: 127500,
          engagementRate: 6.5,
          roi: 48.7,
        },
        {
          id: 5,
          name: 'Sofia Pérez',
          email: 'sofia@example.com',
          niche: 'Fashion & Style',
          rank: 5,
          totalViews: 270000,
          totalEngagement: 7.1,
          totalConversions: 780,
          totalRevenue: 117000,
          engagementRate: 7.1,
          roi: 52.4,
        },
      ]
      return NextResponse.json({ data: dummyRankings })
    }

    return NextResponse.json({ data: rankings })
  } catch (error) {
    console.error('Error fetching influencer ranking:', error)

    // Retornar datos dummy en caso de error
    return NextResponse.json({ data: baseDummyRankings.slice(0, limit) })
  }
}

