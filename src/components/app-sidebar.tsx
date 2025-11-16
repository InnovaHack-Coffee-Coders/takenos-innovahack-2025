"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
  IconBrandCampaignmonitor,
  IconReportAnalytics,
  IconChartInfographic,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Takenos",
    email: "user@takenos.com",
    avatar: "/profile.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Influencers",
      url: "/dashboard/influencers",
      icon: IconUsers,
    },
    {
      title: "Campañas",
      url: "/dashboard/campaigns",
      icon: IconBrandCampaignmonitor,
    },
    {
      title: "Retorno inversión",
      url: "/dashboard/roi",
      icon: IconChartInfographic,
    },
    /*{
      title: "Reportes",
      url: "/dashboard/reports",
      icon: IconReportAnalytics,
    },
    */
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="text-[#6C48C5] hover:text-[#5A3AA8] transition-colors">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-bold">Takenos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
