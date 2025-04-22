'use client'
import { TvMinimalPlay, UserRoundPlus, Users, PlaneLanding, PlaneTakeoff} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "Individual",
        url: "/individual",
        icon: Users,
    },
    {
        title: "Group Competition",
        url: "/group-competition",
        icon: TvMinimalPlay,
    },
    {
        title: "Kringencompetition",
        url: "/kringen-competition",
        icon: TvMinimalPlay,
    },
    {
        title: "Register Runners",
        url: "/register-runners",
        icon: UserRoundPlus,
    },
    {
        title: "Start",
        url: "/start",
        icon: PlaneTakeoff,
    },
    {
        title: "Finish",
        url: "/finish",
        icon: PlaneLanding,
    }
];

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
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}