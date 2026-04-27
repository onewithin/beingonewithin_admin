import Image from 'next/image';
import { ReactNode } from 'react';

export default function Login({ children }: { children: ReactNode }) {
    return (
        <div className='lg:flex flex-1 bg-gradient-to-b from-[#E5F2D6] to-[#FFFFFF] h-screen p-1'>
            <div className='lg:w-1/2  bg-[#1F5D57] h-full p-1 rounded-[20px]  flex flex-col lg:justify-center items-center'>
                <div className="h-[200px] w-[200px]  relative lg:hidden">
                    <Image
                        src="/assets/logo1.png"
                        alt="logo"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                {children}
            </div>
            <div className='w-1/2 lg:flex justify-center items-center hidden'>
                <div className="h-[500px] w-[500px]  relative">
                    <Image
                        src="/assets/logo1.png"
                        alt="logo"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            </div>
        </div >
    );
}
