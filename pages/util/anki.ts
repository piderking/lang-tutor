import chalk from "chalk";
import { Tool, ToolCall } from "ollama";

// ---------------- Types ----------------

export interface AnkiRequest<TAction extends typeof ROUTES[number] = typeof ROUTES[number]> {
    action: TAction;
    version: 6;
    params?: AnkiParameters;
}

interface AnkiParameters {
    card?: number;
    keys?: string[];
    newValues?: string[];
    cards?: number[];
    query?: string;
    answers?: { cardId: number; ease: number }[];
    days?: string;
    deck?: string;
    cardsToo?: boolean;
}

export interface AnkiResponse<T = any> {
    result?: T;
    error?: string | null;
}

// ---------------- Routes ----------------

export const ROUTES = [
    "version",
    "sync",
    "addNote",
    "addNotes",
    "updateNote",
    "deleteNotes",
    "findNotes",
    "notesInfo",
    "getTags",
    "addTags",
    "removeTags",
    "replaceTags",
    "replaceTagsInAllNotes",
    "clearUnusedTags",
    // deck related
    "createDeck",
    "deleteDecks",
    "getDecks",
    "deckNames",
    "deckNamesAndIds",
    "getDeckConfig",
    "saveDeckConfig",
    "setDeckConfigId",
    // card related
    "findCards",
    "cardsInfo",
    "setSpecificValueOfCard",
    "setDueDate",
    "setEaseFactors",
    "areDue",
    "areSuspended",
    "suspend",
    "unsuspend",
    // misc
    "exportPackage",
    "importPackage",
    "getProfiles",
    "loadProfile",
    "multi",
    "reloadCollection",
    "deleteTags",
] as const;

type Route = typeof ROUTES[number];

// ---------------- API Mapping ----------------

type API = {
    [R in Route]: (req: AnkiRequest<R>) => Promise<AnkiResponse>;
};


// ---------------- Param Schemas ----------------
const RouteParamSchemas: Record<Route, any> = {
    version: {
        type: "object",
        description: "Get the version of the AnkiConnect API.",
        properties: {},
        required: [],
    },
    sync: {
        type: "object",
        description: "Synchronize the local collection with AnkiWeb.",
        properties: {},
        required: [],
    },

    addNote: {
        type: "object",
        description: "Add a single new note to the collection.",
        properties: {
            note: {
                type: "object",
                description: "The note object containing deckName, modelName, fields, tags, etc.",
            },
        },
        required: ["note"],
    },
    addNotes: {
        type: "object",
        description: "Add multiple notes to the collection in one call.",
        properties: {
            notes: {
                type: "array",
                description: "Array of note objects.",
                items: { type: "object" },
            },
        },
        required: ["notes"],
    },
    updateNote: {
        type: "object",
        description: "Update fields or tags of an existing note.",
        properties: {
            note: {
                type: "object",
                description: "The updated note object, including note id and modified fields.",
            },
        },
        required: ["note"],
    },
    deleteNotes: {
        type: "object",
        description: "Delete one or more notes by ID.",
        properties: {
            notes: {
                type: "array",
                description: "IDs of notes to delete.",
                items: { type: "number" },
            },
        },
        required: ["notes"],
    },
    findNotes: {
        type: "object",
        description: "Search for notes matching a given query string.",
        properties: {
            query: {
                type: "string",
                description: "An Anki search query (e.g. 'deck:Default tag:foo').",
            },
        },
        required: ["query"],
    },
    notesInfo: {
        type: "object",
        description: "Retrieve complete information for specific note IDs.",
        properties: {
            notes: {
                type: "array",
                description: "IDs of notes to fetch info for.",
                items: { type: "number" },
            },
        },
        required: ["notes"],
    },
    getTags: {
        type: "object",
        description: "Get a list of all tags in the collection.",
        properties: {},
        required: [],
    },
    addTags: {
        type: "object",
        description: "Add one or more tags to specified notes.",
        properties: {
            notes: {
                type: "array",
                description: "IDs of notes to add tags to.",
                items: { type: "number" },
            },
            tags: {
                type: "string",
                description: "Space-separated tags to add.",
            },
        },
        required: ["notes", "tags"],
    },
    removeTags: {
        type: "object",
        description: "Remove tags from notes.",
        properties: {
            notes: {
                type: "array",
                description: "IDs of notes to remove tags from.",
                items: { type: "number" },
            },
            tags: {
                type: "string",
                description: "Space-separated tags to remove.",
            },
        },
        required: ["notes", "tags"],
    },
    replaceTags: {
        type: "object",
        description: "Replace one tag with another on given notes.",
        properties: {
            notes: {
                type: "array",
                description: "IDs of notes to update.",
                items: { type: "number" },
            },
            tag_to_replace: {
                type: "string",
                description: "The tag name to replace.",
            },
            replace_with_tag: {
                type: "string",
                description: "The new tag name.",
            },
        },
        required: ["notes", "tag_to_replace", "replace_with_tag"],
    },
    replaceTagsInAllNotes: {
        type: "object",
        description: "Replace one tag with another across all notes.",
        properties: {
            tag_to_replace: { type: "string", description: "The tag name to replace." },
            replace_with_tag: { type: "string", description: "The new tag name." },
        },
        required: ["tag_to_replace", "replace_with_tag"],
    },
    clearUnusedTags: {
        type: "object",
        description: "Remove tags that are not used by any notes.",
        properties: {},
        required: [],
    },

    createDeck: {
        type: "object",
        description: "Create a new deck if it does not already exist.",
        properties: { deck: { type: "string", description: "The deck name." } },
        required: ["deck"],
    },
    deleteDecks: {
        type: "object",
        description: "Delete decks by name.",
        properties: {
            decks: {
                type: "array",
                description: "Deck names to delete.",
                items: { type: "string" },
            },
        },
        required: ["decks"],
    },
    getDecks: {
        type: "object",
        description: "Get the deck for each card in the given list.",
        properties: {
            cards: {
                type: "array",
                description: "Card IDs to look up.",
                items: { type: "number" },
            },
        },
        required: ["cards"],
    },
    deckNames: {
        type: "object",
        description: "Get the names of all decks.",
        properties: {},
        required: [],
    },
    deckNamesAndIds: {
        type: "object",
        description: "Get the names and IDs of all decks.",
        properties: {},
        required: [],
    },
    getDeckConfig: {
        type: "object",
        description: "Retrieve configuration for a given deck.",
        properties: { deck: { type: "string", description: "Deck name." } },
        required: ["deck"],
    },
    saveDeckConfig: {
        type: "object",
        description: "Save a modified deck configuration.",
        properties: { config: { type: "object", description: "Deck config object." } },
        required: ["config"],
    },
    setDeckConfigId: {
        type: "object",
        description: "Assign a configuration to one or more decks.",
        properties: {
            decks: {
                type: "array",
                description: "Names of decks to update.",
                items: { type: "string" },
            },
            configId: {
                type: "number",
                description: "The deck configuration ID.",
            },
        },
        required: ["decks", "configId"],
    },

    findCards: {
        type: "object",
        description: "Find cards matching a given query string.",
        properties: {
            query: {
                type: "string",
                description: "An Anki search query (e.g. 'is:new').",
            },
        },
        required: ["query"],
    },
    cardsInfo: {
        type: "object",
        description: "Get info for specific cards.",
        properties: {
            cards: {
                type: "array",
                description: "Card IDs.",
                items: { type: "number" },
            },
        },
        required: ["cards"],
    },
    setSpecificValueOfCard: {
        type: "object",
        description: "Update a specific property of a card.",
        properties: {
            card: { type: "number", description: "Card ID." },
            key: { type: "string", description: "Property key to update." },
            newValue: { type: "string", description: "The new value." },
        },
        required: ["card", "key", "newValue"],
    },
    setDueDate: {
        type: "object",
        description: "Set due date for cards.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
            date: { type: "string", description: "Due date string (e.g. '3d', '2025-01-01')." },
        },
        required: ["cards", "date"],
    },
    setEaseFactors: {
        type: "object",
        description: "Set ease factors for cards.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
            easeFactors: { type: "array", description: "Ease factors per card.", items: { type: "number" } },
        },
        required: ["cards", "easeFactors"],
    },
    areDue: {
        type: "object",
        description: "Check if given cards are due.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
        },
        required: ["cards"],
    },
    areSuspended: {
        type: "object",
        description: "Check if given cards are suspended.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
        },
        required: ["cards"],
    },
    suspend: {
        type: "object",
        description: "Suspend given cards.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
        },
        required: ["cards"],
    },
    unsuspend: {
        type: "object",
        description: "Unsuspend given cards.",
        properties: {
            cards: { type: "array", description: "Card IDs.", items: { type: "number" } },
        },
        required: ["cards"],
    },

    exportPackage: {
        type: "object",
        description: "Export a deck as an Anki package file.",
        properties: {
            deck: { type: "string", description: "Deck name to export." },
            path: { type: "string", description: "File path for the .apkg file." },
        },
        required: ["deck", "path"],
    },
    importPackage: {
        type: "object",
        description: "Import a .apkg package file.",
        properties: {
            path: { type: "string", description: "File path to the .apkg file." },
        },
        required: ["path"],
    },
    getProfiles: {
        type: "object",
        description: "List available user profiles.",
        properties: {},
        required: [],
    },
    loadProfile: {
        type: "object",
        description: "Load a given user profile.",
        properties: { name: { type: "string", description: "Profile name." } },
        required: ["name"],
    },
    multi: {
        type: "object",
        description: "Perform multiple actions in one request.",
        properties: {
            actions: {
                type: "array",
                description: "List of sub-requests (action, params).",
                items: { type: "object" },
            },
        },
        required: ["actions"],
    },
    reloadCollection: {
        type: "object",
        description: "Reload the collection from disk.",
        properties: {},
        required: [],
    },
    deleteTags: {
        type: "object",
        description: "Delete tags completely from the collection.",
        properties: {
            tags: { type: "string", description: "Space-separated tags to delete." },
        },
        required: ["tags"],
    },
};




// ---------------- API Implementation ----------------
export type ToolHandler = (tc: ToolCall) => Promise<string>;

export const AnkiAPI: {
    url: string;
    api: API;
    anki_call: <R extends Route>(req: AnkiRequest<R>) => Promise<AnkiResponse>;
} = {
    url: "http://172.28.240.1:8765",
    anki_call: async <R extends Route>(req: AnkiRequest<R>) => {
        const { action, version, params, } = req;
        const resp = await fetch(AnkiAPI.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, version, params }),
        });
        return resp.json();
    },
    api: Object.fromEntries(
        ROUTES.map((route) => [
            route,
            (req: AnkiRequest<typeof route>) => AnkiAPI.anki_call({ ...req, action: route }),

        ])
    ) as { [R in Route]: (req: AnkiRequest<R>) => Promise<AnkiResponse> },

};

// ---------------- Tool Definition ----------------


export const AnkiAPITool: Tool[] = ROUTES.map((route) => ({
    type: "function",
    function: {
        name: route,
        description: `Call the AnkiConnect '${route}' action.`,
        parameters: RouteParamSchemas[route],
    },
}));

// ---------------- Tool Function ----------------
export const AnkiAPIToolDef: Array<[string, ToolHandler]> = ROUTES.map(
    (route): [Route, ToolHandler] => [
        route,
        async (tc: ToolCall): Promise<string> => {
            try {
                const params = tc.function.arguments;
                const req: AnkiRequest<typeof route> = {
                    action: route, // literal type
                    version: 6,
                    params: tc.function?.arguments ?? {},
                };
                // @ts-ignore
                let res = await AnkiAPI.api[route](req);



                if (res.result) {
                    // Build display string for arguments
                    let argsDisplay = Object.entries(tc.function.arguments)
                        .map(([f, v]) => `${f}=${v !== "" ? v.toString() : "VALUE IS NONE. TRY DIFFERENT PARAMETERS"}`)
                        .join(", ");

                    // Format result safely
                    let resultDisplay;
                    if (res.result === undefined || res.result === "" || (Array.isArray(res.result) && res.result.length === 0)) {
                        resultDisplay = "(no result. result is an empty value. its either purposefully empty or running into an error)";
                    } else if (typeof res.result === "object") {
                        resultDisplay = JSON.stringify(res.result, null, 2);
                    } else {
                        resultDisplay = res.result.toString();
                    }

                    let rep = `🔧 Tool call: ${tc.function.name}(${argsDisplay}): ${typeof (res.result)} => ${resultDisplay}`;
                    return rep;


                } else {
                    console.log(chalk.red(res.error))
                    return (res.error ?? "ERROR").toString()
                }



            } catch (err: any) {
                return JSON.stringify({ error: err.message ?? String(err) }, null, 2);
            }
        },
    ]
);
