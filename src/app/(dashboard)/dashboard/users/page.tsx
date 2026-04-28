import React from 'react'
import { DataTableDemo } from './_components/usersTable'

function page() {
    return (
        <div className='p-6'>
            <div className="mb-1">
                <h1 className="text-xl font-extrabold text-[#2B7272] font-rubik-400">Registered Users</h1>
                <p className="text-sm text-gray-400 font-rubik-400 mt-0.5">Manage and monitor all registered users.</p>
            </div>
            <DataTableDemo />
        </div>
    )
}

export default page