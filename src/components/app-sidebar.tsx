'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { sidebarLinks } from "@/lib/constants"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function AppSidebar() {
    const pathname = usePathname()
    return (
        <Sidebar className="rounded-[20px]">
            <SidebarHeader>
                <div className="flex items-center gap-3 p-2 border-2 rounded-2xl border-[#F5F5F5]">
                    <div className="w-9 h-9 rounded-xl bg-[#1F5D57] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-rubik-500 text-sm">B</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-rubik-500 text-[13px] leading-tight truncate">BeingOneWithin</p>
                        <p className="text-[#BEBEBE] font-rubik-400 text-[11px]">Admin Panel</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {sidebarLinks.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-2 p-2 my-1 h-[41px] rounded-md cursor-pointer ${pathname == item.href ? "bg-[#C1ECE8] text-[#1F5D57]" : "hover:bg-muted "}`}>
                                <item.icon className="w-5 h-5" color={pathname == item.href ? "#1F5D57" : "#000000"} />
                                <span className="text-[16px] font-rubik-500">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className=" flex items-center gap-2 p-1 border-2 rounded-2xl border-[#F5F5F5] cursor-pointer" onClick={() => signOut({ callbackUrl: '/login' })}>
                    <div className={`flex items-center gap-2 p-2 my-1 h-[41px] rounded-md cursor-pointer hover:bg-muted`} >
                        <LogOut className="w-5 h-5" />
                        <span className="text-[16px] font-rubik-500">Logout</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar >
    )
}