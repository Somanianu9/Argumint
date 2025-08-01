"use client";

import React from "react"
import { config } from "./config";
import { SequenceConnect } from "@0xsequence/connect"

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SequenceConnect config={config}>
            {children}
        </SequenceConnect>
    )
}

export default Providers;