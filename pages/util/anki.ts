interface AnkiRequest {
    action: string,
    version: 6,
    params?: AnkiCardParameters
    url: string,

}

interface AnkiCardParameters {
    card?: number,
    keys?: string[],
    newValues?: string[],


    cards?: number[],

    query?: string,

    answers?: { cardId: number, easy: number }[],

    days?: string,
    deck?: "Default", // Auto set to default
    cardsToo?: boolean,

}

interface AnkiDeckParameters {
    cards?: number[],



}

interface AnkiResponse {

}
const ROUTES = [
    "setSpecificValueOfCard"
] as const;

type API = {
    [key in typeof ROUTES[number]]: ({ action, version, params, url }: AnkiRequest) => Promise<AnkiResponse>;
};


export const AnkiAPI: { url: string, api: API, anki_call: { (req: AnkiRequest): Promise<{ [key: string]: any }> } } = {
    url: "http://172.28.240.1:8765",
    anki_call: async (req) => {
        const { action, version, params, url } = req;
        let t = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        }

        )
        return await t.json()
    },
    api: {
        setSpecificValueOfCard: async ({ action, version, params }: AnkiRequest) => {
            return "VALUE HERE"
        }
    }
}

