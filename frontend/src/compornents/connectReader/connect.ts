import type { RefObject } from "react"
import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

export const sleep = (ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms))

export const connectReader = async (
    readerRef: RefObject<WebUsbCardReader | null>
    ) => {
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

export const WaitForReader = async (
        reader: WebUsbCardReader
    ): Promise<string> => {
        while (true) {
            console.log("カード待機中...")

            const result = await reader.polling(10)

            console.log("polling result:", result)

            if (result?.idm) {
                console.log("カード検出完了")
                console.log("IDm:", result.idm)

                return result.idm
            }

            console.log("カード未検出")
            await sleep(300)
        }
}