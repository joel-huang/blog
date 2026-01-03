"use client"

import { useRouter } from "next/navigation"
import { CircleSmall, Dot } from "lucide-react"
import { useRef, useEffect } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/divelog/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/divelog/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile, state } = useSidebar()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || state !== "expanded") return

    const card = cardRef.current
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      card.style.setProperty("--mouse-x", `${x}px`)
      card.style.setProperty("--mouse-y", `${y}px`)
      card.style.setProperty("--rotate-x", `${rotateX}deg`)
      card.style.setProperty("--rotate-y", `${rotateY}deg`)
    }

    const handleMouseLeave = () => {
      card.style.setProperty("--rotate-x", "0deg")
      card.style.setProperty("--rotate-y", "0deg")
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [state])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div ref={cardRef} className="holo-card-wrapper">
          <SidebarMenuButton
            size="lg"
            className="holo-card data-[state=open]:bg-divelog-accent data-[state=open]:text-divelog-accent-foreground bg-divelog-card-background border border-divelog-card-border"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">J</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-divelog-muted-foreground text-xs truncate">
                  <span className="text-xs text-[#0070D3] truncate">●</span>
                  <span className="text-xs text-divelog-muted-foreground">AOW</span>
                </div>
                <div className="flex items-center gap-1 text-divelog-muted-foreground text-xs truncate">
                  <span className="text-xs text-[#e32118] truncate">●</span>
                  <span className="text-xs text-divelog-muted-foreground">EANx</span>
                </div>
              </div>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
