import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Datos dummy de influencers
const dummyInfluencers = [
  { id: 1, name: 'María García', email: 'maria@example.com', niche: 'Beauty & Lifestyle', referralCode: 'MARIA2025' },
  { id: 2, name: 'Carlos Rodríguez', email: 'carlos@example.com', niche: 'Tech & Gadgets', referralCode: 'CARLOS2025' },
  { id: 3, name: 'Ana Martínez', email: 'ana@example.com', niche: 'Fitness & Wellness', referralCode: 'ANA2025' },
  { id: 4, name: 'Luis Fernández', email: 'luis@example.com', niche: 'Travel & Adventure', referralCode: 'LUIS2025' },
  { id: 5, name: 'Sofia Pérez', email: 'sofia@example.com', niche: 'Fashion & Style', referralCode: 'SOFIA2025' },
  { id: 6, name: 'Diego Morales', email: 'diego@example.com', niche: 'Food & Cooking', referralCode: 'DIEGO2025' },
  { id: 7, name: 'Valentina Ruiz', email: 'valentina@example.com', niche: 'Music & Entertainment', referralCode: 'VALEN2025' },
  { id: 8, name: 'Andrés Sánchez', email: 'andres@example.com', niche: 'Sports & Fitness', referralCode: 'ANDRES2025' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const niche = searchParams.get('niche')

    const where: Prisma.InfluencerWhereInput = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (niche) {
      where.niche = niche
    }

    const influencers = await prisma.influencer.findMany({
      where,
      include: {
        socialAccounts: {
          include: {
            socialPlatform: true,
          },
        },
        influencerCampaigns: {
          include: {
            campaign: true,
          },
        },
        _count: {
          select: {
            posts: true,
            influencerCampaigns: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Si no hay influencers en la BD, retornar datos dummy
    if (influencers.length === 0) {
      let filteredDummy = dummyInfluencers
      
      if (search) {
        filteredDummy = dummyInfluencers.filter(
          (inf) =>
            inf.name.toLowerCase().includes(search.toLowerCase()) ||
            inf.email?.toLowerCase().includes(search.toLowerCase()) ||
            inf.referralCode?.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      if (niche) {
        filteredDummy = filteredDummy.filter((inf) => inf.niche === niche)
      }

      return NextResponse.json({ data: filteredDummy })
    }

    return NextResponse.json({ data: influencers })
  } catch (error) {
    console.error('Error fetching influencers:', error)
    // En caso de error, retornar datos dummy
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const niche = searchParams.get('niche')
    
    let filteredDummy = dummyInfluencers
    
    if (search) {
      filteredDummy = dummyInfluencers.filter(
        (inf) =>
          inf.name.toLowerCase().includes(search.toLowerCase()) ||
          inf.email?.toLowerCase().includes(search.toLowerCase()) ||
          inf.referralCode?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (niche) {
      filteredDummy = filteredDummy.filter((inf) => inf.niche === niche)
    }

    return NextResponse.json({ data: filteredDummy })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, birthDate, niche, referralCode } = body

    const influencer = await prisma.influencer.create({
      data: {
        name,
        email,
        birthDate: birthDate ? new Date(birthDate) : null,
        niche,
        referralCode,
      },
      include: {
        socialAccounts: {
          include: {
            socialPlatform: true,
          },
        },
        _count: {
          select: {
            posts: true,
            influencerCampaigns: true,
          },
        },
      },
    })

    return NextResponse.json({ data: influencer }, { status: 201 })
  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Error al crear influencer' },
      { status: 500 }
    )
  }
}

