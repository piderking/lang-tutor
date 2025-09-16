import type { NextApiRequest, NextApiResponse } from "next";
import { ChatOllama } from "@langchain/ollama";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage, BaseMessage, ToolMessage, AIMessageChunk } from "@langchain/core/messages";
import { FlashCardsTool, SquareRootTool, tool_map, } from "../util/tools";
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
    Annotation,
} from "@langchain/langgraph";
// Import or define your StateGraph & MemorySaver
import { tool, Tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Buffer } from "buffer";
import fs from "fs/promises";
import { pull as pp } from "langchain/hub";

import { createStructuredChatAgent, StructuredChatAgentInput } from "langchain/agents";


const MODEL = "qwen3:8b";
const prompt = await pp<ChatPromptTemplate>(
    "hwchase17/structured-chat-agent"
);

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

type ApiResponse = {
    messages_json: string;
    message: string
};



const GraphAnnotation = Annotation.Root({
    final_response: Annotation<string>({
        // Reducer function: Combines the current state with new messages
        reducer: (_, updateValue) => updateValue,
        // Default Initalize to Chat History
        default: () => { return "unfinished request" }
    }),

    // Passed System Messages (exclusively system)
    system_messages: Annotation<SystemMessage[]>({
        // Reducer function: Combines the current state with new messages
        reducer: (currentState, updateValue) => currentState.concat(updateValue),
        // Default Initalize to Chat History
        default: () => [],
    }),

    // Base Messages from the USER (could be a history)
    messages: Annotation<BaseMessage[]>({

        // Reducer function: Combines the current state with new messages
        reducer: (currentState, updateValue) => currentState.concat(updateValue),
        // Default Initalize to Chat History
        default: () => []
    }),


    idx: Annotation<number>({
        reducer: (current, iters) => current + iters,
        default: () => 0
    })


});

type StateGraphAnnotation = typeof GraphAnnotation.State;


export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse | { error: string }>) {
    let model_calls = 0;
    // Create a structured chat agent
    const agent = await createStructuredChatAgent({
        llm: new ChatOllama({ model: MODEL, temperature: 0.7 }),
        tools: Array.from(tool_map.values()),
        prompt: prompt


    });
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { question, history, system_messages } = req.body;
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: "Invalid messages format" });
        }
        if (!system_messages || !Array.isArray(system_messages)) {

            return res.status(400).json({ error: "Invalid system messages format" });
        } if (!question) {

            return res.status(400).json({ error: "Invalid question format" });
        }

        // 6. Map message


        const model = new ChatOllama({ model: MODEL, temperature: 0.7, });
        const tool_model = new ChatOllama({ model: MODEL, temperature: 0.7, }).bindTools(Array.from(tool_map.values()));







        // Define the function that calls the model
        async function generation({ system_messages, messages, idx }: StateGraphAnnotation) {
            console.log("Model Call #" + idx + 1 + ":")
            // No Access to TOOLS
            const response = await model.invoke([
                // includes the tool messages
                // ...system_messages,

                ...messages,
                ...system_messages,

                new HumanMessage(
                    "YOU CAN'T USE TOOLS HERE. You must ONLY rely upon the data that has already been generated" +
                    "Respond to the best of your ability: " +
                    question
                )



            ],);
            const parts: string[] | undefined = response.content.toString().match(/<think>.*?<\/think>|default<think>.*?<\/think>|[^<]+/g)?.map(f => f.toString());

            console.log("Generated Content:\n\t" + "Question:\n\t\t " + question + "\n\t\t" + response.content.toString())

            // // Call to ask for tools
            // // Generate tool list if needed
            // // Turn tool list into AI Readable
            // if (response.tool_calls) {
            //     // Has Tool Calls --> Add to reducer
            //     const tools = await model.invoke(messages)
            //     return {
            //         idx: 1,
            //         tool_messages: [
            //         ]
            //     }
            // }

            return { final_response: response.concat.toString(), messages: response.content, last_response: response };


        }
        // Define the function that calls the model
        async function validation({ messages, idx }: StateGraphAnnotation) {
            console.log("Validation Delibrance Call #" + idx + 1 + ":")
            // No Access to TOOLS
            const response = await model.invoke([
                ...messages,
                new SystemMessage(
                    'You must ONLY output a single JSON object. ' +
                    'Do NOT include any backticks, markdown, or extra text. ' +
                    'The format must be exactly: {"valid": BOOL, "reason": STRING}'
                ),
                new HumanMessage("Generate the JSON object with the feilds filled in regarding the following. Are you ready to quit? If questions were asked, did you respond? Or if no questions were asked did you respond to the best of your ability?")
            ]);



            // try {
            //     const response_json: { valid: boolean, reason?: string } = JSON.parse(response.content.toString())


            // }
            // catch (error) {
            //     console.log("Error During Validation: \n\t" + error)

            // }
            return {
                messages: [...messages, response],
                last_response: response
            };

        }
        async function conditional_validation({ messages, idx }: StateGraphAnnotation) {
            console.log("Validation Delibrance Call #" + idx + 1 + ":")
            console.log(messages[messages.length - 1].content)


            try {
                const response_json: { valid: boolean, reason?: string } = JSON.parse(messages[messages.length - 1].content.toString());

                if (!response_json.valid) {
                    "itteration"
                }


            }
            catch (error) {
                console.log("Error During Validation: \n\t" + error)

            }
            return "__end__"

        }


        // Define the function that calls the model
        async function itteration({ messages, idx }: StateGraphAnnotation) {
            // No Access to TOOLS
            const response = await tool_model.invoke([
                // includes the tool messages
                // ...system_messages,

                ...messages,
                ...system_messages,

                new HumanMessage(
                    "Determine wether you need tools for the following: " +
                    question +
                    "if you do, make the nessecary tool_calls which will be executed. Generate them in JSON schema provided"
                )



            ],);

            console.log("Itteration Content:\n\t" + "Question:\n\t\t " + question + "\n\t\t" + response.content.toString())
            let rp = response.tool_calls?.map(tc => {
                return tc.name
            })
            console.log("Tools Calls: \n\t", rp?.join("\n\t"))


            // // Call to ask for tools
            // // Generate tool list if needed
            // // Turn tool list into AI Readable
            // if (response.tool_calls) {
            //     // Has Tool Calls --> Add to reducer
            //     const tools = await model.invoke(messages)
            //     return {
            //         idx: 1,
            //         tool_messages: [
            //         ]
            //     }
            // }


            return { idx: 1, messages: response.content, last_response: response };
        }





        async function tools({ messages, idx }: StateGraphAnnotation) {
            console.log("Calling Tools #" + idx + 1 + ":")
            const response = await (await agent).invoke([{ role: "user", content: "Hello" }]);
        }




        // Define a new graph
        const workflow = new StateGraph(GraphAnnotation)
            // Entry Point Go to Start
            .addNode("start", async (state: StateGraphAnnotation) => {
                console.log("Workflow Starting...");
                return {};
            })
            .addNode("iterations", itteration)
            .addNode("tools", use_tools)
            .addNode("validation", validation)
            .addNode("generation", generation)



            // Edges
            .addEdge("__start__", "start")
            .addEdge("start", "iterations")
            .addEdge("tools", "generation")
            .addEdge("generation", "validation")

            .addConditionalEdges("validation", conditional_validation, ["iterations", "__end__"])


        // .addNode("tools", toolNode)
        // .addEdge("tools", "agent")
        // .addConditionalEdges("agent", shouldContinue)

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



        const finalState = await app.invoke({
            // Could Pass Args Here but they're defaulted already
        });


        console.log("Completed...")
        res.status(200).json({ message: finalState.final_response, messages_json: JSON.stringify(finalState.messages) });

    } catch (err: any) {
        console.error("Ollama/Graph error:", err);
        res.status(500).json({ message: err.message.toString(), messages_json: JSON.stringify({}) });
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