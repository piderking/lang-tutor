import type { NextApiRequest, NextApiResponse } from "next";
import { ChatOllama } from "@langchain/ollama";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { FinalTool, GetCurrentWeatherTool, SquareRootTool, tool_map, } from "../util/tools";
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from "@langchain/langgraph";
// Import or define your StateGraph & MemorySaver
import { tool, Tool } from "@langchain/core/tools";

const MODEL = "gpt-oss:20b";

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

type ApiResponse = {
    content: string;
};




export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | { error: string }>) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages format" });
        }
        // 6. Map messages
        const chatHistory: BaseMessage[] = messages.map((m: ChatMessage) => {
            switch (m.role) {
                case "user":
                    return new HumanMessage(m.content);
                case "assistant":
                    return new AIMessage(m.content);
                case "system":
                    return new SystemMessage(m.content);
                default:
                    return new HumanMessage(m.content);
            }
        });

        // 1. Instantiate model
        const model = new ChatOllama({ model: MODEL, temperature: 0.7, }).bindTools(Array.from(tool_map.values()));
        // 3. Prompt template
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant"],
            new MessagesPlaceholder("chat_history"),
            new MessagesPlaceholder("agent_scratchpad"),
        ]);
        for (let i = 0; i < 20; i++) {
            console.log("Invoking Response Itteration")
            // 7. Define a workflow graph
            const aiMessage = await model.invoke(await prompt.format({
                chat_history: chatHistory,
                agent_scratchpad: []
            }));
            for (const toolCall of aiMessage.tool_calls ?? []) {
                let tool_message: ToolMessage = await tool_map.get(toolCall.name)?.invoke(toolCall);
                //messages.push(selected);
                console.log(`${toolCall.name}(${JSON.stringify(toolCall.args)}) => ${tool_message.content}`)

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
            console.log("AI Message" + aiMessage.content)
            console.log("Completed Itteration: " + i)





        }
        res.status(500).json({ content: "Tool has no output" });

    } catch (err: any) {
        console.error("Ollama/Graph error:", err);
        res.status(500).json({ error: err.message });
    }

}
