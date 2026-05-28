"use client";

import React, { useEffect, useState } from "react";
import {
    Activity,
    AudioLines,
    BarChart3,
    CircleDollarSign,
    Users,
    Plus,
    MessageSquare,
    Crown,
    Eye,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { dashboardApi } from "@/lib/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface DailyActivity {
    day: string;
    freeUsers: number;
    premiumUsers: number;
}

interface DashboardStats {
    users: { total: number; active: number; newLast30Days: number; newToday: number };
    content: { meditations: number };
    subscriptions: { active: number; newToday: number };
    revenue: { total: number };
    mostPlayed: { title: string; playCount: number } | null;
    dailyActivity: DailyActivity[];
}

function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetcher<{ success: boolean; data: DashboardStats }>(dashboardApi.getStats)
            .then((res) => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const chartData = loading
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
            day,
            "Free Users": 0,
            "Premium Users": 0,
        }))
        : (stats?.dailyActivity ?? []).map((d) => ({
            day: d.day,
            "Free Users": d.freeUsers,
            "Premium Users": d.premiumUsers,
        }));

    const premiumRatio = stats?.users.total
        ? Math.round(((stats.subscriptions.active ?? 0) / stats.users.total) * 100)
        : 0;

    const statCards = [
        {
            label: "Total Users",
            value: loading ? "--" : (stats?.users.total ?? 0).toLocaleString(),
            detail: loading ? "" : `${stats?.users.newToday ?? 0} joined today`,
            icon: Users,
            className: "bg-gradient-to-br from-[#15534c] to-[#28897f] text-white",
        },
        {
            label: "Premium Members",
            value: loading ? "--" : (stats?.subscriptions.active ?? 0).toLocaleString(),
            detail: loading ? "" : `${premiumRatio}% of all users`,
            icon: Crown,
            className: "bg-gradient-to-br from-[#123f66] to-[#2f6da3] text-white",
        },
        {
            label: "Meditations Uploaded",
            value: loading ? "--" : (stats?.content.meditations ?? 0).toLocaleString(),
            detail: "Guided sessions in library",
            icon: AudioLines,
            className: "bg-gradient-to-br from-[#5f4730] to-[#8c6a47] text-white",
        },
        {
            label: "Revenue",
            value: loading ? "--" : `$${(stats?.revenue.total ?? 0).toLocaleString()}`,
            detail: "Total premium revenue",
            icon: CircleDollarSign,
            className: "bg-gradient-to-br from-[#493a6f] to-[#7b59b4] text-white",
        },
    ];

    return (
        <div className="font-rubik-400 w-full p-3 md:p-6">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e3a38] via-[#135f59] to-[#2f8c85] p-6 md:p-8 text-white">
                    <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#8de1d9]/30 blur-2xl" />
                    <div className="absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-[#f6d7a8]/25 blur-2xl" />
                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
                        <div>
                            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs tracking-wide">
                                <Sparkles size={14} />
                                Meditation Admin Center
                            </p>
                            <h1 className="text-2xl md:text-4xl font-rubik-600 leading-tight">Welcome back. Your calm platform is growing.</h1>
                            <p className="mt-2 max-w-2xl text-sm md:text-base text-white/85">
                                Track engagement, publish mindful sessions, and manage the wellness experience from one place.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-white/80">Most Played Session</p>
                            <p className="mt-2 text-lg font-rubik-600">{loading ? "Loading..." : (stats?.mostPlayed?.title ?? "No data yet")}</p>
                            <p className="mt-1 text-sm text-white/80">
                                {loading
                                    ? ""
                                    : stats?.mostPlayed
                                        ? `${stats.mostPlayed.playCount.toLocaleString()} total plays`
                                        : "Upload and promote sessions to see trends here."}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.label} className={`${item.className} border-0 rounded-3xl shadow-sm`}>
                                <CardContent className="p-5">
                                    <div className="mb-4 inline-flex rounded-xl bg-white/20 p-2">
                                        <Icon size={18} />
                                    </div>
                                    <p className="text-sm/5 text-white/90">{item.label}</p>
                                    <p className="mt-1 text-3xl font-rubik-600">{item.value}</p>
                                    <p className="mt-2 text-xs text-white/80">{item.detail}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
                    <Card className="rounded-3xl border-0 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Activity size={20} className="text-[#14574f]" />
                                    <h2 className="text-lg font-rubik-500 text-[#0f403b]">Daily User Activity</h2>
                                </div>
                                <span className="rounded-full bg-[#eef8f7] px-3 py-1 text-xs text-[#14574f]">Last 7 days</span>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} barCategoryGap="24%" barGap={6}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e6eceb" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#4f6a67", fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#4f6a67", fontSize: 12 }}
                                        allowDecimals={false}
                                        width={30}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(13, 70, 64, 0.06)" }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e7f0ee",
                                            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    <Bar dataKey="Free Users" fill="#5ca89b" radius={[8, 8, 0, 0]} maxBarSize={36} />
                                    <Bar dataKey="Premium Users" fill="#d8a955" radius={[8, 8, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <BarChart3 size={18} className="text-[#14574f]" />
                                <h3 className="font-rubik-500 text-[#0f403b]">Quick Actions</h3>
                            </div>
                            <div className="space-y-2">
                                <Button asChild variant="ghost" className="h-11 w-full justify-start text-[#0f403b] hover:bg-[#f2f8f7]">
                                    <Link href="/dashboard/meditation/add" className="inline-flex items-center gap-2">
                                        <Plus size={16} />
                                        Add New Audio
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" className="h-11 w-full justify-start text-[#0f403b] hover:bg-[#f2f8f7]">
                                    <Link href="/feedback" className="inline-flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        View Feedback
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" className="h-11 w-full justify-start text-[#0f403b] hover:bg-[#f2f8f7]">
                                    <Link href="/dashboard/plans" className="inline-flex items-center gap-2">
                                        <Crown size={16} />
                                        Manage Plans
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" className="h-11 w-full justify-start text-[#0f403b] hover:bg-[#f2f8f7]">
                                    <Link href="/dashboard/meditation" className="inline-flex items-center gap-2">
                                        <Eye size={16} />
                                        View All Meditations
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" className="h-11 w-full justify-start text-[#0f403b] hover:bg-[#f2f8f7]">
                                    <Link href="/dashboard/users" className="inline-flex items-center gap-2">
                                        <Users size={16} />
                                        Manage Users
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
