"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { subscriptionApi } from "@/lib/api";

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    intervalCount: number;
    trialDays: number | null;
    stripePriceId: string | null;
    visible: boolean;
    createdAt: string;
}

interface PlanDetailsProps {
    plan: Plan | null;
    onClose: () => void;
    onEdit: (plan: Plan) => void;
    onRefresh: () => void;
}

export function PlanDetails({ plan, onClose, onEdit, onRefresh }: PlanDetailsProps) {
    const [toggling, setToggling] = React.useState(false);
    const [visible, setVisible] = React.useState(Boolean(plan?.visible));

    React.useEffect(() => {
        setVisible(Boolean(plan?.visible));
    }, [plan?.id, plan?.visible]);

    if (!plan) return null;

    const formatDate = (date: string | Date | null) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };

    const billingCycle = `Every ${plan.intervalCount} ${plan.interval}${plan.intervalCount > 1 ? "s" : ""}`;

    const handleToggle = async () => {
        try {
            setToggling(true);
            await fetcher(subscriptionApi.toggleVisibility(plan.id), {
                method: "PATCH",
                data: { visible: !visible },
            });
            setVisible((v) => !v);
            onRefresh();
        } catch (e) {
            console.error(e);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Dialog open={!!plan} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-4 max-w-md max-h-[80vh] overflow-y-auto hide-scrollbar">
                <div className="py-2 font-rubik-400">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[#2B7272]">{plan.name}</h2>
                            <p className="text-sm text-gray-400">Plan Details</p>
                        </div>
                        <Badge
                            className={visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}
                        >
                            {visible ? "Visible" : "Hidden"}
                        </Badge>
                    </div>

                    {/* Fields */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">Price</Label>
                                <Input
                                    readOnly
                                    value={`${plan.currency.toUpperCase()} ${plan.price.toFixed(2)}`}
                                />
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">Billing Cycle</Label>
                                <Input readOnly value={billingCycle} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">Trial Days</Label>
                                <Input readOnly value={plan.trialDays != null ? `${plan.trialDays} days` : "—"} />
                            </div>
                            <div className="w-1/2">
                                <Label className="mb-1 text-[14px] text-[#484848]">Created At</Label>
                                <Input readOnly value={formatDate(plan.createdAt)} />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-wrap gap-2 pt-2 font-rubik-400">
                    <Button
                        variant="outline"
                        onClick={() => { onClose(); onEdit(plan); }}
                    >
                        Edit Plan
                    </Button>

                    <Button
                        variant="outline"
                        disabled={toggling}
                        className={visible
                            ? "text-orange-500 border-orange-300 hover:bg-orange-50"
                            : "text-green-600 border-green-300 hover:bg-green-50"}
                        onClick={handleToggle}
                    >
                        {toggling && <Loader2 className="animate-spin mr-2" size={14} />}
                        {visible ? "Deactivate" : "Activate"}
                    </Button>


                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
