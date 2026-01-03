"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/divelog/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/divelog/components/ui/sidebar"
import { DemoDialog } from "@/app/divelog/components/demo-dialog"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false)

  // Define valid routes - routes that actually exist in the app
  const validRoutes = ['/divelog']

  const isValidUrl = (url: string): boolean => {
    // Check if the URL is in the valid routes list
    return validRoutes.includes(url)
  }

  const handleProjectClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (!isValidUrl(url)) {
      e.preventDefault()
      setDemoDialogOpen(true)
    }
    // If valid, let the default navigation happen
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = item.isActive ?? pathname === item.url
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <a href={item.url} onClick={(e) => handleProjectClick(e, item.url)}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => setDemoDialogOpen(true)}>
                    <Folder className="text-divelog-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDemoDialogOpen(true)}>
                    <Forward className="text-divelog-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDemoDialogOpen(true)}>
                    <Trash2 className="text-divelog-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-divelog-foreground/70"
            onClick={() => setDemoDialogOpen(true)}
          >
            <MoreHorizontal className="text-divelog-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <DemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
    </SidebarGroup>
  )
}
