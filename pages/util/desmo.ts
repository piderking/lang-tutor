interface Request {
    name: string
}



export const ROUTES = [
    "setSpecificValueOfCard"
] as const;


type API = {
    [key in typeof ROUTES[number]]: ({ name }: Request) => Promise<string>;
};



export const DesmosAPI: { url: string, api: API } = {
    url: "",
    api: {
        setSpecificValueOfCard: async ({ name }: Request) => {
            return "VALUE HERE"
        }
    }
}

