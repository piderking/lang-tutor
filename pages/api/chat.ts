import type { NextApiRequest, NextApiResponse } from "next";
import ollama, { ChatRequest, ChatResponse, Message } from 'ollama';

import chalk from 'chalk';

import { createStructuredChatAgent, StructuredChatAgentInput } from "langchain/agents";
import { tool_def, tools } from "../util/tools";
import { AnkiAPI, AnkiAPITool } from "../util/anki";

interface ApiResponse {
    prompt: string
}
interface ApiError {
    message: string
}

const MESSAGE_TYPES = ["user", "assistant", "human", "system"] as const;

interface ReqBody {
    prompt: string,

    history: {}
}

const MODEL = "qwen3:8b";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | ApiError>) {
    const { prompt, system_messages, history }: { prompt: string, system_messages?: Message[], history: Message[] } = req.body;
    try {
        let it: number = 0;
        console.log("Started...")

        let output = "NO OUTPUT SET";

        const messages: Message[] = [...history]

        const num = 20;
        while (it < num) {
            console.log(chalk.bgCyan("Itteration: " + it + "/" + num + "=> " + (it / num) + "%    "))
            // Pull together previous responses
            const response = await ollama.chat({
                model: MODEL,
                messages: [
                    ...messages,

                    ...(system_messages ??
                        [
                            { role: "system", content: "You are a friendly AI Agent!" },
                        ]
                    ),
                    { role: 'system', content: "Answer the following prompt and ONLY use tools if exclusively nessecary, check for generated data before you use tools and use it for calling other tools." },
                    { role: "system", content: "Output responses in HTML ONLY. To style the outputted html, use tailwindcss in the HTML. Don't create an extra container around the output, it's already wrapped in one." },
                    { role: "user", content: prompt }

                ],
                tools: tools,
                think: true,
            });
            console.log(chalk.bold("Prompt: ") + chalk.italic(prompt))
            console.log(chalk.bold("Reasoning:\n") + response.message.thinking)

            if (response.message.tool_calls && response.message.tool_calls.length > 0) {
                console.log(chalk.bold("Using Tools:"))

                response.message.tool_calls.forEach((value) => {
                    if (tool_def.has(value.function.name)) {
                        console.log(chalk.green("\n\tFound: " + value.function.name))
                        const tool = tool_def.get(value.function.name);
                        if (tool) {
                            const result = tool(value);
                            console.log(chalk.green("\n\tResult: " + result))

                            messages.push({
                                role: "tool",
                                content: result,
                                tool_calls: [value],
                                tool_name: value.function.name,
                            })
                            console.log(chalk.yellow("\n\tAdded To Messages"))
                        }
                        else {
                            console.log(chalk.red("\n\tCouldn't Call Function! Error!"))
                            messages.push({
                                role: "tool",
                                content: "Function: " + value.function.name + " Couldn't be called. Don't call it again!",
                                tool_calls: [value],
                                tool_name: value.function.name,
                            })

                        }

                    } else {
                        messages.push({
                            role: "tool",
                            content: "Function: " + value.function.name + " Doesn't Exsist! Don't try calling it again!",
                            tool_calls: [value],
                            tool_name: value.function.name,
                        })
                        console.log(chalk.red("\n\tMissing: " + value.function.name))
                    }
                })

            } else {
                console.log(chalk.yellow("No Tools Called"))

                console.log(chalk.green("Completed..."))
                output = response.message.content
                console.log(chalk.bold("Output:\n") + response.message.thinking)

                break;
            }

            it += 1;
        }
        res.status(200).json({ message: output });



    } catch (err: any) {
        console.error(chalk.red("Ollama/Graph error:", err));
        res.status(500).json({ message: err.message.toString(), });
    }

}



function pull<T>(arg0: string) {
    throw new Error("Function not implemented.");
}

function initializeAgentExecutor(toolsArray: any, toolModel: any, arg2: string) {
    throw new Error("Function not implemented.");
}
/* 
 for (let i = 0; i < 20; i++) {
            console.log("Invoking Response Itteration")
            // 7. Define a workflow graph
            const aiMessage = await model.invoke(await prompt.format({
                chat_history: chatHistory,
                agent_scratchpad: []
            }));

            console.log(aiMessage)
            for (const toolCall of aiMessage.tool_calls ?? []) {
                let tool_message: ToolMessage = await tool_map.get(toolCall.name)?.invoke(toolCall);
                //messages.push(selected);
                // console.log(`${toolCall.name}(${JSON.stringify(toolCall.args)}) => ${tool_message.content}`)

                if (toolCall.name == "final") {
                    return res.status(200).json({
                        // content: response.content.toString(),
                        content: tool_message.content.toString()
                    });
                } else {
                    chatHistory.push(
                        new HumanMessage(
                            `${toolCall.name} => ${tool_message.content}`
                        )
                    )
                    console.log(chatHistory)
                }


            }
            console.log("Completed Itteration: " + i)





        }
*/