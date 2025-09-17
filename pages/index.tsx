import React, { useState } from 'react'
import { ArrowLeftOnRectangleIcon, AcademicCapIcon, BoltIcon, ChatBubbleLeftIcon, ExclamationTriangleIcon, HandThumbDownIcon, HandThumbUpIcon, LinkIcon, MoonIcon, PaperAirplaneIcon, PencilSquareIcon, PlusIcon, SignalIcon, SunIcon, TrashIcon, UserIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import Link from 'next/link'
import Image from 'next/image'
import { ChatRes } from './components'
import { Message } from './interfaces/messages'
import ReactDOMServer from "react-dom/server";
import AnkiModal from './components/anki'
interface Prompts {
    role: string,
    content: string,
}
interface Data {
    language: string,
    hasAnswered: boolean,
    messages: Message[],

    system_prompts: Prompts[]


}

let initialData: [string, Data][] = [
    ["french", {
        language: "french",
        hasAnswered: false,
        messages: [],
        system_prompts: [
            {
                role: "system",
                content: "You're roleplaying as a bilingual character to help someone learn a language. You're name is Gerome and you are helping the user learn french."
            },
            {
                role: "system",
                content: "You're roleplaying as a bilingual character to help someone learn a language. You're name is Gerome and you are helping the user learn french."
            },]
    }],
    ["french-conj", {
        language: "french conjugation",
        hasAnswered: false,
        messages: [],
        system_prompts: []

    }],
];
const Home = () => {
    // Default State
    const [data, setData] = useState<Map<string, Data>>(new Map(initialData)); // State for a dynamic array of strings
    const [timeUpdated, setNeedsToUpdate] = useState(0);
    const update = () => {
        setNeedsToUpdate(timeUpdated + 1)

    }
    const addMessage = (key: string, newMessage: Message) => {
        let new_data = data;

        console.log("Adding Message Here")
        new_data.set(key.toLowerCase(), {
            ...(data.get(key.toLowerCase()) ?? {
                language: "french",
                hasAnswered: true,
                messages: [],
                system_prompts: [],

            }),
            messages: [...(new_data.get(key)?.messages ?? []), newMessage]
        })
        setData(new_data)
        update()
    }
    // Add Message
    const sendMessagetoAI = (key: string, newMessage: Message) => {
        addMessage(key, newMessage)
        setLoading(true)

        const response = fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // PAST MESSAGES GO HERE
                // TODO
                history: [
                    ...getDataFromKey(key)?.messages ?? [
                        {
                            role: "system", content: "Tell developer their system prompts didn't work"
                        }
                    ],
                ],
                system_messages: [
                    ...getDataFromKey(key)?.system_prompts ?? [
                        {
                            role: "system", content: "Tell developer their system prompts didn't work"
                        }
                    ],

                ],
                prompt: newMessage.message,
            }),
        }).then(f => f.json()).then((f: {
            message?: string,
            messages_json?: string
        }) => {
            addMessage(key, {
                is_agent: true,
                message: f.message ?? "ADDED UNDEFINED MESSAGE",
                full_query: f.messages_json,
            });
            setLoading(false)
            console.log("Data State", data.get(ckey))

            update()
        });
        // setMessages([...messages, newMessage]); // Add new item to the array
    };

    // Add Message
    const setHasAnswered = (key: string, b: boolean) => {
        let new_data = data;

        new_data.set(key.toLowerCase(), {
            ...(data.get(key.toLowerCase()) ?? {
                language: "french",
                hasAnswered: b,
                messages: [],
                system_prompts: []

            }),
            hasAnswered: b
        })
        setData(new_data)
        update()

        // setMessages([...messages, newMessage]); // Add new item to the array
    };


    // Intergrated Functions (use key variable)
    const getDataFromKey = (key?: string): Data | undefined => {
        return data.get(key ?? ckey)
    }
    const getLang = (): string | undefined => {
        return getDataFromKey()?.language
    }
    const getHasAnswered = (): boolean | undefined => {
        return getDataFromKey()?.hasAnswered
    }

    const getAllLangs = () => {
        let t = Array.from(data.keys()).map((f) => {
            return (
                <div
                    key={f}
                    onClick={() => setKey(f)}
                    className={`flex space-x-2 p-2 mx-2 rounded text-white items-center
                        hover:bg-black/80
                        ${ckey === f ? 'bg-blue-500' : ''}`}
                >
                    <ChatBubbleLeftIcon className='h-6 w-6 text-gray-300' />
                    <p>{getDataFromKey(f)?.language}</p>
                </div>
            )
        });
        return <div className='mt-5 flex flex-col text-white'>
            {
                t
            }



        </div>
    }

    const [ckey, setKey] = useState("french");
    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    return (
        <div className='h-screen bg-white text-black flex'>
            <AnkiModal isOpen={false} onClose={function (): void {
            }} url={'https://ankiweb.net/decks'} />

            {/* Sidebar */}
            <div className='w-64 flex flex-col'>
                <div className='relative flex flex-col flex-grow overflow-y-auto bg-black pt-5'>
                    <button onClick={() => {
                        alert("TODO Create new chat")
                    }} className='flex space-x-1 p-2 hover:bg-gray-700 mx-2 border border-gray-300 rounded text-white'>
                        <PlusIcon className='h-6 w-6' />
                        New Chat
                    </button>
                    {getAllLangs()}
                    <div className='absolute bottom-0 inset-x-0 border-t border-gray-200/50 mx-2 py-6 px-2'>
                        <Link href="/update" className='flex space-x-2 p-2 hover:bg-black/80 mx-2 rounded text-white text-sm items-center'>
                            <ArrowPathIcon className='h-5 w-5 text-gray-300' />
                            <p>{timeUpdated}</p>
                        </Link>
                        <Link href="/home" className='flex space-x-2 p-2 hover:bg-black/80 mx-2 rounded text-white text-sm items-center'>
                            <AcademicCapIcon className='h-5 w-5 text-gray-300' />
                            <p>piderking</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className='flex-1 flex flex-col h-full relative'>
                {/* Messages or Welcome Screen */}
                {!getHasAnswered() ? (
                    <div className='flex flex-col space-y-4 justify-center items-center flex-1'>
                        <h1 className='text-3xl font-bold pb-12'>{getLang() ?? "error"}</h1>
                        <div className='space-y-2'>
                            <div className='grid grid-cols-3 gap-4 text-center text-lg'>
                                <div className='p-2 font-semibold flex flex-col justify-center items-center'><SunIcon className='h-5 w-5' />Examples</div>
                                <div className='p-2 font-semibold flex flex-col justify-center items-center'><BoltIcon className='h-5 w-5' />Capabilities</div>
                                <div className='p-2 font-semibold flex flex-col justify-center items-center'><ExclamationTriangleIcon className='h-5 w-5' />Limitations</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex-1 overflow-y-auto p-4 space-y-2'>
                        {getDataFromKey()?.messages.map((m: Message, idx: number) => (
                            <ChatRes key={idx} author={m.author} author_image={m.author_image} is_agent={m.is_agent} message={m.message} full_query={m.full_query} />
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className='border-t border-gray-300 p-4'>
                    <div className='flex items-center space-x-2 shadow-md rounded px-2 border border-gray-300'>
                        <input
                            placeholder={loading ? "Loading..." : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    sendMessagetoAI(ckey, { is_agent: false, message: input });
                                    setInput("");
                                }
                                setHasAnswered(ckey, true)
                            }}
                            className='flex-1 bg-white p-2 border-0 focus:outline-none'
                            value={input}
                        />
                        <PaperAirplaneIcon
                            className='h-4 w-4 text-right -rotate-45 cursor-pointer'
                            onClick={() => {
                                setHasAnswered(ckey, true);
                                sendMessagetoAI(ckey, { is_agent: false, message: input });
                                setInput("");
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Home