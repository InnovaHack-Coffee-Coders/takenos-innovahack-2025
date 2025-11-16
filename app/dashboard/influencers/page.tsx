'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconSearch, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import type { InfluencerWithRelations } from '@/shared/types/influencer.types'

export default function InfluencersPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<InfluencerWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInfluencers()
  }, [search])

  const fetchInfluencers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const res = await fetch(`/api/influencers?${params.toString()}`)
      const data = await res.json()
      setInfluencers(data.data || [])
    } catch (error) {
      console.error('Error fetching influencers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este influencer?')) return

    try {
      await fetch(`/api/influencers/${id}`, { method: 'DELETE' })
      fetchInfluencers()
    } catch (error) {
      console.error('Error deleting influencer:', error)
    }
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-[28px] font-bold text-[#1A1A2E] mb-2">Influencers</h1>
                  <p className="text-[16px] text-[#6B6B8D]">
                    Gestiona y visualiza la información de los influencers
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/influencers/new')}
                  className="bg-gradient-to-r from-[#8B6FD9] to-[#6C48C5] text-white rounded-2xl px-6"
                >
                  <IconPlus className="w-4 h-4 mr-2" />
                  Nuevo Influencer
                </Button>
              </div>

              <Card className="rounded-[20px] border-[rgba(108,72,197,0.1)] shadow-[0_4px_20px_rgba(108,72,197,0.08)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B6B8D]" />
                      <Input
                        placeholder="Buscar por nombre, email o código de referido..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 rounded-2xl"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-[#6B6B8D]">Cargando...</div>
                  ) : influencers.length === 0 ? (
                    <div className="text-center py-8 text-[#6B6B8D]">
                      No se encontraron influencers
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[rgba(108,72,197,0.1)]">
                          <TableHead className="text-[#1A1A2E] font-semibold">Nombre</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold">Nicho</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold">Código Referido</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold">Redes Sociales</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold">Campañas</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold">Posts</TableHead>
                          <TableHead className="text-[#1A1A2E] font-semibold text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {influencers.map((influencer) => (
                          <TableRow
                            key={influencer.id}
                            className="border-[rgba(108,72,197,0.1)] hover:bg-[#F8F7FC] cursor-pointer"
                            onClick={() => router.push(`/dashboard/influencers/${influencer.id}`)}
                          >
                            <TableCell className="font-medium text-[#1A1A2E]">
                              {influencer.name}
                            </TableCell>
                            <TableCell className="text-[#6B6B8D]">
                              {influencer.niche || '-'}
                            </TableCell>
                            <TableCell className="text-[#6B6B8D]">
                              {influencer.referralCode || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {influencer.socialAccounts.map((account) => (
                                  <Badge
                                    key={account.id}
                                    variant="outline"
                                    className="border-[#6C48C5] text-[#6C48C5]"
                                  >
                                    {account.socialPlatform.code === 'tiktok' ? 'TikTok' : 'Instagram'}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-[#6B6B8D]">
                              {influencer._count?.influencerCampaigns || 0}
                            </TableCell>
                            <TableCell className="text-[#6B6B8D]">
                              {influencer._count?.posts || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/dashboard/influencers/${influencer.id}/edit`)
                                  }}
                                  className="text-[#6C48C5] hover:text-[#5A3AA8]"
                                >
                                  <IconEdit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(influencer.id)
                                  }}
                                  className="text-[#EF4444] hover:text-[#DC2626]"
                                >
                                  <IconTrash className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
