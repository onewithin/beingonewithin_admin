import React from "react";
import { TransactionsTable } from "./_components/transactionsTable";

function TransactionsPage() {
    return (
        <div className="p-6">
            <div className="mb-1">
                <h1 className="text-xl font-extrabold text-[#2B7272] font-rubik-400">Transactions</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">
                    View and monitor all payment transactions.
                </p>
            </div>
            <TransactionsTable />
        </div>
    );
}

export default TransactionsPage;
