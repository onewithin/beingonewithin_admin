import React from "react";
import { PlansTable } from "./_components/plansTable";

function PlansPage() {
    return (
        <div className="p-6">
            <div className="mb-1">
                <h1 className="text-xl font-extrabold text-[#2B7272] font-rubik-400">Subscription Plans</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">
                    Manage and configure subscription plans.
                </p>
            </div>
            <PlansTable />
        </div>
    );
}

export default PlansPage;
