import { TvMinimalPlay,ChartNoAxesCombined, UserRoundPlus, Users, Search, SkipForward, CloudDrizzle } from "lucide-react"
import { Switch } from "@/components/ui/switch";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Statistics",
        url: "#",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Queue up",
        url: "#",
        icon: UserRoundPlus,
    },
    {
        title: "Live runners",
        url: "#",
        icon: TvMinimalPlay,
    },
    {
        title: "Queue",
        url: "#",
        icon: Users,
    },
    {
        title: "Controls",
        url: "#",
        icon: SkipForward,
    },
    {
        title: "Query",
        url: "#",
        icon: Search,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <div className="flex items-center">
                                        <CloudDrizzle />
                                        <span>Raining: </span>
                                        <Switch/>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
