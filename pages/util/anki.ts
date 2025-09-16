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

}

interface AnkiDeckParameters {
    cards?: number[],
    deck?: "Default", // Auto set to default
    cardsToo?: boolean,


}

interface AnkiResponse {

}
const ROUTES = [
    "setSpecificValueOfCard"
] as const;

export type API = {
    [key in typeof ROUTES[number]]: ({ action, version, params }: AnkiRequest) => Promise<AnkiResponse>;
};

const AnkiAPI: API = {
    setSpecificValueOfCard: async ({ action, version, params }: AnkiRequest) => {
        return {

        }
    }
}