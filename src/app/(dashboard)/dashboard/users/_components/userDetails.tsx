import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldBan, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { apiUser } from "@/lib/api";
import { toast } from "sonner";

function UserDetails({
    user,
    onClose,
    handleAction,
}: {
    user: any;
    onClose: () => void;
    handleAction: (id: string, status: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(Boolean(user?.active));
    const [detailUser, setDetailUser] = useState<any>(user);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        setDetailUser(user);
        setActive(Boolean(user?.active));
        setDetailLoading(true);
        fetcher(apiUser.getUserById(user.id), { method: "GET" })
            .then((res: any) => {
                if (res?.success && res?.user) {
                    setDetailUser(res.user);
                    setActive(Boolean(res.user.active));
                }
            })
            .catch(() => { /* keep basic data on error */ })
            .finally(() => setDetailLoading(false));
    }, [user?.id]);

    if (!user) return null;

    const formatDate = (date: string | Date | null) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };

    const formatDateTime = (date: string | Date | null) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    const formatListeningTime = (seconds: number) => {
        if (!seconds) return "0 mins";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
        return `${mins} min${mins !== 1 ? "s" : ""}`;
    };


    const handleDeactivate = async () => {
        try {
            setLoading(true);
            if (active) {
                await fetcher(apiUser.deactivateUsers(user.id), { method: "PATCH", data: { active: false } });
                toast.success("Account deactivated", {
                    description: `${user.name || "User"}'s account has been deactivated.`,
                    className: "bg-orange-50 text-orange-900 border border-orange-200 font-rubik-400",
                    duration: 4000,
                    closeButton: true,
                });
            } else {
                await fetcher(apiUser.activeUser(user.id), { method: "PATCH", data: { active: true } });
                toast.success("Account activated", {
                    description: `${user.name || "User"}'s account has been activated.`,
                    className: "bg-green-50 text-green-900 border border-green-200 font-rubik-400",
                    duration: 4000,
                    closeButton: true,
                });
            }
            handleAction(user.id, !active);
            setActive(!active)
        } catch (err) {
            console.error("Error updating status", err);
            toast.error("Failed to update account status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
                <div className="py-2 font-rubik-400">

                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={detailUser?.image || "/assets/person.jpg"}
                                alt="user-avatar"
                                className="rounded-md object-cover"
                                style={{ width: 150, height: 150 }}
                            />
                        </div>
                        <div className="flex flex-col gap-3 w-2/3">
                            <div>
                                <Label htmlFor="name" className="mb-1 text-[14px] text-[#484848]">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={detailUser?.name || "—"}
                                    readOnly
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-1 text-[14px] text-[#484848]">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    value={detailUser?.email || "—"}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-2 mt-4 flex flex-col gap-2">
                        <div className="flex gap-3">
                            <div className="block w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Signup Method
                                </Label>
                                <div className="mt-1">
                                    <Badge variant={"outline"} className="text-rubik-400 rounded-2xl">
                                        <span className="text-[14px] font-light flex gap-2 items-center">
                                            <Mail className="h-4 w-4" /> {detailUser?.signupMethod || "Email"}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Subscription
                                </Label>
                                <Input
                                    type="text"
                                    value={detailUser?.subscriptionType || "Free"}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Joined
                                </Label>
                                <Input
                                    type="text"
                                    value={formatDate(detailUser?.createdAt)}
                                    readOnly
                                />
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Last Login
                                </Label>
                                <Input
                                    type="text"
                                    value={formatDateTime(detailUser?.lastLogin)}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Subscription Ends
                                </Label>
                                <Input
                                    type="text"
                                    value={formatDate(detailUser?.trialEnds)}
                                    readOnly
                                />
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Email Verified
                                </Label>
                                <Input
                                    type="text"
                                    value={detailUser?.isVerified ? "Yes" : "No"}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Meditations Played
                                </Label>
                                <Input
                                    type="text"
                                    value={detailUser?.meditationsPlayedCount?.toString() ?? "0"}
                                    readOnly
                                />
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">
                                    Liked Meditations
                                </Label>
                                <Input
                                    type="text"
                                    value={detailUser?.likedMeditationsCount?.toString() ?? "0"}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <Label className="mb-1 text-[14px] text-[#484848]">
                                Total Listening Time
                            </Label>
                            <Input
                                type="text"
                                value={formatListeningTime(detailUser?.totalListeningSeconds ?? 0)}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="font-rubik-500 cursor-pointer"
                        onClick={handleDeactivate}
                        disabled={loading}
                    >
                        <ShieldBan className="mr-2 h-4 w-4" />
                        {loading
                            ? "Processing..."
                            : active
                                ? "Deactivate Account"
                                : "Activate Account"}
                    </Button>
                    {/* <Button variant="outline" className="font-rubik-500 cursor-pointer" disabled={loading}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete User
                    </Button>
                    <Button
                        className="font-rubik-500 bg-[#1F5D57] text-white"
                        disabled={loading}
                    >
                        Send email
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default UserDetails;
