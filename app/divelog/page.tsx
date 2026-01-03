import { AppSidebar } from "@/app/divelog/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/divelog/components/ui/breadcrumb"
import { Separator } from "@/app/divelog/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/divelog/components/ui/sidebar"
import { parseDivesCSV } from "@/app/divelog/utils/parseDives"
import { parseMediaFiles } from "@/app/divelog/utils/parseMedia"
import { DiveCard } from "@/app/divelog/components/dive-card"

export default async function DivesPage() {
  const dives = await parseDivesCSV()
  const mediaFiles = await parseMediaFiles()

  return (
    <SidebarProvider>
      <AppSidebar
        collapsible="icon"
        variant="inset"
        side="left"
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-4xl px-4 sm:px-4 pt-4 sm:pt-6">
            <div className="flex flex-col gap-4 sm:gap-6 pb-4 sm:pb-6">
              {dives.map((dive) => (
                <DiveCard key={dive.diveNumber} dive={dive} mediaFiles={mediaFiles} />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
