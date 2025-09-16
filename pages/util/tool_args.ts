import { Tool, ToolCall } from "ollama";

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

];


const tool_def = new Map([
    ["get_current_flashcard_set", (tc: ToolCall): string => {
        return "Currently Studying French 411!"
    }],

])


// Export tools if needed elsewhere
export { tools, tool_def };
