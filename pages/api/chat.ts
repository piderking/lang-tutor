import type { NextApiRequest, NextApiResponse } from "next";
import { ChatOllama } from "@langchain/ollama";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { FixConjugation, SquareRootTool, tool_map, } from "../util/tools";
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from "@langchain/langgraph";
// Import or define your StateGraph & MemorySaver
import { tool, Tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Buffer } from "buffer";
import fs from "fs/promises";



const MODEL = "MFDoom/deepseek-r1-tool-calling:7b";

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

type ApiResponse = {
    content: string;
};




export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | { error: string }>) {
    let model_calls = 0;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages, system_messages } = req.body;

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

        // 6. Map messages
        const systemMessages: BaseMessage[] = messages.map((m: ChatMessage) => {
            switch (m.role) {
                default:
                    return new SystemMessage(m.content);
            }
        });

        // 1. Instantiate model
        const model = new ChatOllama({ model: MODEL, temperature: 0.7, }).bindTools(Array.from(tool_map.values()));
        const toolNode = new ToolNode(Array.from(tool_map.values()));


        // Helper Functions
        function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
            console.log("Should Continue?")
            const lastMessage = messages[messages.length - 1] as AIMessage;

            // If the LLM makes a tool call, then we route to the "tools" node
            if (lastMessage.tool_calls?.length) {
                console.log("Yes")

                return "tools";
            }

            console.log("No. End")

            // Otherwise, we stop (reply to the user) using the special "__end__" node
            return "__end__";
        }

        // Define the function that calls the model
        async function callModel(state: typeof MessagesAnnotation.State) {
            model_calls += 1
            console.log("Model Call #" + model_calls + ":")

            const response = await model.invoke(state.messages);

            console.log("\tHas Tool Calls" + Boolean(response.tool_calls))
            // We return a list, because this will get added to the existing list
            return { messages: [response] };
        }



        // Define a new graph
        const workflow = new StateGraph(MessagesAnnotation)
            .addNode("agent", callModel)
            .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
            .addNode("tools", toolNode)
            .addEdge("tools", "agent")
            .addConditionalEdges("agent", shouldContinue)

        // Finally, we compile it into a LangChain Runnable.
        const app = workflow.compile();


        let graph = await app.getGraphAsync();
        const image = await graph.drawMermaidPng();


        // Define the output file path and name
        const outputPath = 'public/graph.png'; // Or .png, .gif, etc., depending on your image data

        try {
            await fs.writeFile(outputPath, new Uint8Array(await image.arrayBuffer()));
            console.log(`Image successfully written to ${outputPath}`);
        } catch (error) {
            console.error("Error writing image:", error);
        }



        // Use the agent
        const finalState = await app.invoke({
            messages: [
                ...systemMessages,
                ...chatHistory
            ],
        });
        console.log(finalState.messages[finalState.messages.length - 1].content);

        const nextState = await app.invoke({
            // Including the messages from the previous run gives the LLM context.
            // This way it knows we're asking about the weather in NY
            messages: [
                new SystemMessage("Final Step: THIS OUTPUTS TO USER"),

            ],
        });
        console.log(nextState.messages[nextState.messages.length - 1].content);

        console.log("Completed...")
        res.status(200).json({ content: nextState.messages[nextState.messages.length - 1].content.toString() });

    } catch (err: any) {
        console.error("Ollama/Graph error:", err);
        res.status(500).json({ error: err.message });
    }

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