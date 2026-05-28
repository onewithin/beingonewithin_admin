import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/app-sidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Navigator from '@/components/navigator';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions)

    return (
        <div className='min-h-screen flex-1 bg-[radial-gradient(circle_at_top,_#eef8f7_0%,_#f5f5f5_45%,_#f3f4f4_100%)]'>
            <SidebarProvider>
                <AppSidebar />
                <main className='flex-1 overflow-x-hidden pb-6'>
                    <div className='sticky top-0 z-20 mx-3 mt-3 flex items-center gap-2 rounded-2xl border border-[#e4efee] bg-white/90 px-3 py-2 backdrop-blur md:mx-6'>
                        <SidebarTrigger className='hover:bg-[#eef8f7]' />
                        <Navigator />
                    </div>
                    {children}
                </main>
            </SidebarProvider>
        </div >
    );
}
