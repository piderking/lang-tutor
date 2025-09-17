import { HandThumbUpIcon, HandThumbDownIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline"
import Link from 'next/link'
import Image from 'next/image'
import React, { ReactNode, FC, useState } from "react";
import { Message } from "./interfaces/messages";
import { remark } from 'remark';
import html from 'remark-html';


const Name = (isAgent: boolean) => {
    if (isAgent) {
        return "Agent"
    } else {
        return "User"
    }
}

export const ChatRes = ({ author, author_image, is_agent, message, full_query }: Message) => {
    const [open, setOpen] = useState(false);
    let text = "";

    let items: string[] = JSON.parse(full_query ?? "[]");


    return (
        <>
            {is_agent && <div className='w-full flex items-center justify-center bg-gray-200 border-t border-b border-gray-500/40'>
                <div className='flex space-x-4 items-center justify-between px-6 py-6 w-1/2'>
                    <div className='flex space-x-4 items-center'>
                        <div className='h-8 w-16 bg-teal-600 text-center p-2 rounded text-white relative'>
                            <Image src={author_image ?? "/logo.svg"} fill alt={author ?? Name(is_agent)} />
                        </div>
                        <div className="" dangerouslySetInnerHTML={{ __html: message }} />


                    </div>
                    <div className='flex space-x-1'>
                        <HandThumbUpIcon className='h-6 w-6' />
                        <HandThumbDownIcon className='h-6 w-6' />
                    </div>
                </div>
            </div>}
            {!is_agent && <div className='w-full flex items-center justify-center'>
                <div className='flex space-x-4 bg-white items-center justify-between px-6 py-6 w-1/2'>
                    <div className='flex space-x-4 items-center'>
                        <div className='h-8 w-16 text-center p-2 rounded text-black relative'>
                            <UserIcon className='h-8 w-8' />
                        </div>
                        <div onClick={() => setOpen(!open)}>
                            <div className="" dangerouslySetInnerHTML={{ __html: message }} />

                        </div>
                        {open && full_query && (
                            <ul className="mt-2 bg-white border rounded-md shadow divide-y">
                                {items.map((item) => (
                                    <li
                                        key={item}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{item}</div>
                                        {/* <div className="text-sm text-gray-500">{item.description}</div> */}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <PencilSquareIcon className='h-6 w-6 border-black color-black' />
                </div>
            </div>}
        </>

    )
};