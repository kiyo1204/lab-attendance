import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

let readerInstance: WebUsbCardReader | null = null

let connectingPromise: Promise<WebUsbCardReader> | null = null

export const connectReader = async (): Promise<WebUsbCardReader> => {
    if (readerInstance) {
        console.log("既存のカードリーダーを使用")
        return readerInstance
    }

    if (connectingPromise) {
        return connectingPromise
    }

    connectingPromise = (async () => {
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

export const pollingReader = async (maxTryCount = 1) => {
    const reader = await connectReader()

    return await reader.polling(maxTryCount)
}

/**
 * カードがタッチされるまで待機する
 */
export const waitForCard = async (
    isCancelled?: () => boolean
): Promise<string | null> => {
    console.log("カード待機開始")

    while (true) {
        if (isCancelled?.()) {
            console.log("カード待機キャンセル")
            return null
        }

        const result = await pollingReader(1)

        if (isCancelled?.()) {
            return null
        }

        if (result?.idm) {
            console.log("カード検出:", result.idm)

            return result.idm
        }

        await sleep(300)
    }
}