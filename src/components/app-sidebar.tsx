'use client'
import { User, Settings, UserRoundPlus, Users, PlaneLanding, PlaneTakeoff} from "lucide-react";
import Image from "next/image";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";


const SchildIcon = () => (
    <Image src="/schild.svg" alt="Schild Icon" width={16} height={16} />
);

// Menu items.
const items = [
    {
        title: "Kringencompetitie",
        url: "/kringen-competition",
        icon: SchildIcon,
    },
    {
        title: "Group Competition",
        url: "/group-competition",
        icon: Users,
    },
    {
        title: "Individual",
        url: "/individual",
        icon: User,
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
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
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