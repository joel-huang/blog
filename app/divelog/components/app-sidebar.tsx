"use client"

import * as React from "react"
import {
  Home,
  PersonStanding,
  Waves,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { NavMain } from "@/app/divelog/components/nav-main"
import { NavProjects } from "@/app/divelog/components/nav-projects"
import { NavUser } from "@/app/divelog/components/nav-user"
import { DemoDialog } from "@/app/divelog/components/demo-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/app/divelog/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false)

  const data = {
    user: {
      name: "Joel Huang",
      email: "huang.joel@hotmail.com",
      avatar: "../profile.jpg",
    },
    projects: [
      {
        name: "Dives",
        url: "/divelog",
        icon: Waves,
        isActive: pathname === "/divelog",
      },
      {
        name: "Buddies",
        url: "/divelog/buddies",
        icon: PersonStanding,
        isActive: pathname === "/divelog/buddies",
      },
    ],
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <div className="bg-divelog-primary text-divelog-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Waves className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Joel's Divelog</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
      <DemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
    </Sidebar>
  )
}
