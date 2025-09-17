import { Tool, ToolCall } from 'ollama';
import wr from 'wordreference-api';


interface Request {
    word: string,
    to: string,
    from: string
}


export const word_reference_tools: Tool[] = [
    {
        type: "function",
        function: {
            name: "convert_to",
            description: "Convert from language to another language. Only need if nessecary",
            parameters: {
                type: "object",
                properties: {
                    word: {
                        type: "string",
                        description: "Singular word From Language to Langauge"
                    },
                    from: {
                        type: "string",
                        description: "language converting from: options are es, en, it, fr"
                    },
                    to: {
                        type: "string",
                        description: "language converting to: options are es, en, it, fr"
                    }
                },
                required: [],
            },
        },
    },


];

export const word_reference_tools_def = [
    ["get_flashcards_in_set", (tc: ToolCall): string => {
        const flashcards = [
            ["bonjour", "hello"]
        ]
        return `Current Flashcards in set ${tc.function.arguments["set"]} are:\n${flashcards.map(card => card[0] + ": " + card[1]).join("\n")}`
    }],
]