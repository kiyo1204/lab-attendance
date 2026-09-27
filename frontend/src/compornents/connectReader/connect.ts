import type { RefObject } from "react"
import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

export const sleep = (ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms))

let readerInstance: WebUsbCardReader | null = null

let connectingPromise: Promise<WebUsbCardReader> | null = null

let usbQueue: Promise<void> = Promise.resolve()

export const connectReader = async (): Promise<WebUsbCardReader> => {
    // すでに取得済みなら再接続しない
    if (readerInstance) {
        console.log("既存のカードリーダーを使用")
        return readerInstance
    }

    // 接続処理中ならその接続を待つ
    if (connectingPromise) {
        console.log("カードリーダー接続待ち")
        return connectingPromise
    }

    console.log("カードリーダー新規接続")
    
    connectingPromise = (async() => {
        const reader = await WebUsbCardReader.connect(
            ["RC-S300/P"],
            true
        )

        if (!reader) {
            throw new Error("リーダーに接続できませんでした")
        }

        readerInstance = reader
        
        return reader
    })()

    try {
        return await connectingPromise
    } finally {
        connectingPromise = null
    }
}

// USB操作を直列化してPollingの二重実行を防ぐ
export const pollingReader = async (maxTryCount = 1) => {
    const reader = await connectReader()

    const result = await reader.polling(maxTryCount)

    return result
}