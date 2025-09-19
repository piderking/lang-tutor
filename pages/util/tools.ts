import { Tool, ToolCall } from "ollama";
import { AnkiAPITool, AnkiAPIToolDef, ToolHandler } from "./anki";
type Parameters = Tool["function"]["parameters"];


// Example tools array
const tools: Tool[] = [

    ...AnkiAPITool

];


const tool_def = new Map<string, ToolHandler>([
    // ["get_current_flashcard_set", async (tc: ToolCall) => {
    //     return ""
    // }],
    // ["get_flashcards_in_set", async (tc: ToolCall) => {
    //     return ""
    // }],
    ...AnkiAPIToolDef
    // Dynamically add all Anki routes as handlers



])


// Export tools if needed elsewhere
export { tools, tool_def };
