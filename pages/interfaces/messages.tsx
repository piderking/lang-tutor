import React, { ReactNode, FC } from "react";

export interface Message {
    author?: string
    author_image?: string

    is_agent: boolean,

    message: string,
    full_query?: string,
    // any props that come into the component
}
