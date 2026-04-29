"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart3,
    Users,
    Plus,
    MessageSquare,
    Crown,
    Eye,
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

    return (
        <div className="flex font-rubik-400 w-full">
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 bg-white p-5 rounded-3xl px-5">
                    <h1 className="text-2xl font-semibold text-[#2b7272] mb-1">Welcome back, Admin!</h1>
                    <p className="text-[#777777]">Here's what's happening at a glance.</p>
                </div>

                {/* Quick Stats */}
                <div className="mb-6 bg-white p-5 rounded-3xl">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-[#013913]" />
                        <h2 className="text-lg font-medium text-[#013913]">Quick Stats</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-2 xl:gap-4 rounded-3xl">
                        <Card className="bg-[#8e4692] text-white border-0 rounded-4xl h-[180px]">
                            <CardContent className="p-6">
                                <div className="items-center gap-2 mb-2 flex justify-center">
                                    <Users size={20} />
                                    <span className="text-sm opacity-90">Total Users</span>
                                </div>
                                <div className="text-4xl font-rubik-500 mb-1 text-center">
                                    {loading ? "—" : (stats?.users.total ?? 0).toLocaleString()}
                                </div>
                                <div className="text-sm opacity-75 text-center">
                                    {loading ? "" : `${stats?.users.newToday ?? 0}+ today`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#545c90] text-white border-0 rounded-4xl h-[180px]">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-2 justify-center">
                                    <Crown size={20} />
                                    <span className="text-sm opacity-90">Premium Users</span>
                                </div>
                                <div className="text-3xl font-bold mb-1 text-center">
                                    {loading ? "—" : (stats?.subscriptions.active ?? 0).toLocaleString()}
                                </div>
                                <div className="text-sm opacity-75 text-center">
                                    {loading ? "" : `${stats?.subscriptions.newToday ?? 0}+ today`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#578957] text-white border-0 rounded-4xl h-[180px]">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-2 justify-center">
                                    <BarChart3 size={20} />
                                    <span className="text-sm opacity-90">Contents Uploaded</span>
                                </div>
                                <div className="text-3xl font-bold text-center">
                                    {loading ? "—" : (stats?.content.meditations ?? 0).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#a2605b] text-white border-0 rounded-4xl h-[180px]">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-2 justify-center">
                                    <span className="text-lg">⭐</span>
                                    <span className="text-sm opacity-90">Most Played</span>
                                </div>
                                <div className="text-lg font-semibold mb-2 text-center">
                                    {loading ? "—" : (stats?.mostPlayed?.title ?? "N/A")}
                                </div>
                                {!loading && stats?.mostPlayed && (
                                    <div className="text-sm opacity-75 text-center">
                                        {stats.mostPlayed.playCount.toLocaleString()} plays
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Daily User Activity Chart */}
                <div className="flex gap-2">
                    <div className="bg-white p-4 px-6 rounded-3xl flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-medium text-[#013913]">Daily User Activity</h2>
                                <span className="text-sm text-[#777777]">( Last 7 Days )</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#777777", fontSize: 13 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#777777", fontSize: 12 }}
                                    allowDecimals={false}
                                    width={30}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                                        fontSize: 13,
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={10}
                                    wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                                />
                                <Bar dataKey="Free Users" fill="#f4b03c" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                <Bar dataKey="Premium Users" fill="#c084e0" radius={[6, 6, 0, 0]} maxBarSize={36} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <div className="bg-white w-80 p-2 rounded-3xl text-[#013913]">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">⚡</span>
                                <h3 className="font-medium text-[#013913]">Quick Actions</h3>
                            </div>
                            <div className="space-y-4">
                                <Link href="/dashboard/meditation/add" passHref>
                                    <Button asChild variant="ghost" className="w-full justify-start gap-2 text-[#013913] hover:bg-[#f5f5f5]">
                                        <span>
                                            <Plus size={16} />
                                            Add New Audio
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/feedback" passHref>
                                    <Button asChild variant="ghost" className="w-full justify-start gap-2 text-[#013913] hover:bg-[#f5f5f5]">
                                        <span>
                                            <MessageSquare size={16} />
                                            View Feedback
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/plans" passHref>
                                    <Button asChild variant="ghost" className="w-full justify-start gap-2 text-[#013913] hover:bg-[#f5f5f5]">
                                        <span>
                                            <Crown size={16} />
                                            Manage Plans
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/meditation/" passHref>
                                    <Button asChild variant="ghost" className="w-full justify-start gap-2 text-[#013913] hover:bg-[#f5f5f5]">
                                        <span>
                                            <Eye size={16} />
                                            View All Meditations
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/users" passHref>
                                    <Button asChild variant="ghost" className="w-full justify-start gap-2 text-[#013913] hover:bg-[#f5f5f5]">
                                        <span>
                                            <Users size={16} />
                                            Manage Users
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
