import { ChatOllama } from "@langchain/ollama";
import { Tool } from "@langchain/core/tools";


export class GetCurrentWeatherTool extends Tool {
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


export class FinalTool extends Tool {
    name = "final";
    description = "Based on all responses from any itteration, if it answeres the original question, call this function and output the final response  ";

    async _call(output: string,): Promise<string> {
        // Simulate fetching weather data
        return output;
    }
}
export const tool_map: Map<string, Tool> = new Map(
    [
        // Tools
        new GetCurrentWeatherTool(),
        new SquareRootTool(),


        // Validation Tool

        // Final Tool
        new FinalTool()
    ].map((t: Tool) => [t.getName(), t])
)