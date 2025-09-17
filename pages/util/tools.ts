import { Tool, ToolCall } from "ollama";
import { AnkiAPITool } from "./anki";
type Parameters = Tool["function"]["parameters"];


// Example tools array
const tools: Tool[] = [
    {
        type: "function",
        function: {
            name: "get_current_flashcard_set",
            description: "Get the current anki flashcard set.",
            parameters: {
                type: "object",
                properties: {
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_flashcards_in_set",
            description: "Get the current anki flashcard set.",
            parameters: {
                type: "object",
                properties: {
                    set: {
                        type: "string",

                    }
                },
                required: [
                    "set"
                ],
            },
        },
    },
    ...AnkiAPITool

];


const tool_def = new Map([
    ["get_current_flashcard_set", (tc: ToolCall): string => {
        return "Currently Studying French 411!"
    }],
    ["get_flashcards_in_set", (tc: ToolCall): string => {
        const flashcards = [
            ["bonjour", "hello"]
        ]
        return `Current Flashcards in set ${tc.function.arguments["set"]} are:\n${flashcards.map(card => card[0] + ": " + card[1]).join("\n")}`
    }],


])


// Export tools if needed elsewhere
export { tools, tool_def };
