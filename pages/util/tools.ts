import { ChatOllama } from "@langchain/ollama";
import { tool, Tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily"
import z from "zod/v3";

export class FixConjugation extends Tool {
    name = "get_current_weather";
    description = "Get the current weather for a specified city.";

    async _call(input: string): Promise<string> {
        // Simulate fetching weather data
        return `The weather in ${input} is sunny with a temperature of 25°C.`;
    }
}

export class SquareRootTool extends Tool {
    name = "square_root_tool";
    description = "Get the square root of a number";

    async _call(x: string,): Promise<string> {
        // Simulate fetching weather data
        return "" + Math.sqrt(Number(x))
    }
}


// const getWeather: Tool = tool(
//     async (input: { city: string }) => {
//         return `It's always sunny in ${input.city}!`;
//     },
//     {
//         name: "getWeather",
//         schema: z.object({
//             city: z.string().describe("The city to get the weather for"),
//         }),
//         description: "Get weather for a given city.",
//     }
// );

export const tool_map: Map<string, Tool> = new Map(
    [
        // Tools
        new FixConjugation(),
        // new TavilySearch({ maxResults: 3 }),


    ].map((t: Tool) => [t.getName(), t])
)