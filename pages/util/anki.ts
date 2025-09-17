interface AnkiRequest {
    action: string,
    version: 6,
    params?: AnkiCardParameters

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
    [key in typeof ROUTES[number]]: ({ action, version, params }: AnkiRequest) => Promise<AnkiResponse>;
};

export const AnkiAPI: { url: string, api: API } = {
    url: "",
    api: {
        setSpecificValueOfCard: async ({ action, version, params }: AnkiRequest) => {
            return "VALUE HERE"
        }
    }
}

