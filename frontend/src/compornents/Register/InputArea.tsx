import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

const sleep = (ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms))

export default function StudentRegisterForm() {
    // リーダー読み込み
    const readerRef = useRef<WebUsbCardReader | null>(null)

    // 名前，学年，学籍番号
    const [name, setName] = useState("")
    const [grade, setGrade] = useState("")
    const [studentNumber, setStudentNumber] = useState("")

    const [status, setStatus] = useState("")
    const [isWaiting, setIsWaiting] = useState(false)

    const connectReader = async () => {
        if (readerRef.current) {
            readerRef.current
        }
    
    const reader = await WebUsbCardReader.connect(
        ["RC-S300/P"],
        false
    )
    if (!reader) {
        throw new Error("リーダーに接続できませんでした")
    }

    readerRef.current = reader
    return reader
}

const WaitForReader = async (
    reader: WebUsbCardReader
): Promise<string> => {
    while (true) {
        const result = await reader.polling()

        if (result) {
            return result.idm
        }

        await sleep(200)
    }
}

const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
) => {
    e.preventDefault()

    if (!name.trim() || !studentNumber.trim() || !grade.trim()) {
        setStatus("名前，学年，学籍番号を入力してください")
        return
    }

    try {
        setIsWaiting(true)

        // リーダー接続(一旦接続なし)
        //const reader = await connectReader()

        // カード待機
        setStatus("カードをタッチしてください")

        // 一旦接続なしでテスト
        // const cardId = await WaitForReader(reader)
        const cardId = "ABC"

        // ID取得
        setStatus("カードを読み取りました．登録中...")

        // APIへ登録
        const response = await fetch("/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                studentId: studentNumber.trim(),
                name: name.trim(),
                cardId: cardId.trim(), 
                grade: grade.trim(),
                status: "0"
            })
        })

        if (!response.ok) {
            throw new Error("登録に失敗しました")
        }

        // 完了
        setStatus("登録しました")
        setName("")
        setGrade("")
        setStudentNumber("")

    } catch (error) {
        console.error(error)
        setStatus("登録に失敗しました")
    } finally {
        setIsWaiting(false)
    }
    }

    return (
        <form className="registar-area" onSubmit={handleSubmit}>
            <div>
                <label>
                    名前
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isWaiting}
                    />
                </label>
            </div>

            <div>
                <label>
                    学年
                    <input
                        type="text"
                        value={grade}
                        onChange={(e) =>
                            setGrade(e.target.value)
                        }
                        disabled={isWaiting}
                        />
                </label>
            </div>

            <div>
                <label>
                    学籍番号
                    <input
                        type="text"
                        value={studentNumber}
                        onChange={(e) =>
                            setStudentNumber(e.target.value)
                        }
                        disabled={isWaiting}
                        />
                </label>
            </div>

            <button
                type="submit"
                disabled={isWaiting}
            >
                {isWaiting
                ? "カードをタッチしてください"
                : "カードをタッチして登録"}
            </button>

            {status && <p>{status}</p>}
        </form>
    )
}