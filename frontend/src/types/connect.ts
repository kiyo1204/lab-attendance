import { useRef, useState } from "react"
import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

const connectReader = async (readerRef) => {
    if (readerRef.current) {
        return readerRef.current
    }
    
    const reader = await WebUsbCardReader.connect(
            ["RC-S300/P"],
            true
        )

        if (!reader) {
            throw new Error("リーダーに接続できませんでした")
        }

    readerRef.current = reader
    return reader
}