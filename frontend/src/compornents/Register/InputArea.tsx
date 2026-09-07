import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { WebUsbCardReader } from "@ogrtk/simple-felica-reader"

import { connectReader, WaitForReader } from "../connectReader/connect"

export default function StudentRegisterForm() {
    // リーダー読み込み
    const readerRef = useRef<WebUsbCardReader | null>(null)

    // 名前，学年，学籍番号
    const [name, setName] = useState("")
    const [course, setCourse] = useState("B")
    const [grade, setGrade] = useState("1")
    const [studentNumber, setStudentNumber] = useState("")

    const [status, setStatus] = useState("")
    const [isWaiting, setIsWaiting] = useState(false)

const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
) => {
    e.preventDefault()

    if (!name.trim() || !studentNumber.trim() || !course || !grade) {
        setStatus("名前，学年，学籍番号を入力してください")
        return
    }

    try {
        setIsWaiting(true)

        // リーダー接続(一旦接続なし)
        const reader = await connectReader(readerRef)

        // カード待機
        setStatus("カードをタッチしてください")

        // 一旦接続なしでテスト
        const card_id = await WaitForReader(reader)
        //const cardId = "ABC"

        // ID取得
        setStatus("カードを読み取りました．登録中...")

        // APIへ登録
        const response = await fetch("/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                student_id: studentNumber.trim(),
                name: name.trim(),
                card_id: card_id.trim(), 
                grade: `${course}${grade}`,
            })
        })

        if (!response.ok) {
            throw new Error("登録に失敗しました")
        }

        // 完了
        setStatus("登録しました")
        setName("")
        setCourse("B")
        setGrade("1")
        setStudentNumber("")

    } catch (error) {
        console.error(error)
        setStatus("登録に失敗しました")
    } finally {
        setIsWaiting(false)
    }
    }

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <div>
                <label>
                    名前
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isWaiting}
                        pattern="[^0-9０-９]+"
                        title="数字以外を入力してください"
                        required
                    />
                </label>
            </div>

            <div>
                <label>
                    学年
                    <div className="grade-select">
                        <select
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            disabled={isWaiting}
                            required
                        >
                            <option value="B">B</option>
                            <option value="M">M</option>
                            <option value="D">D</option>
                        </select>

                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={isWaiting}
                            required
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3" disabled={course==="M"}>3</option>
                            <option value="4" disabled={course==="M"}>4</option>
                        </select>
                    </div>
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
                        required
                        minLength={7}
                        maxLength={7}
                        title="学籍番号は7文字で入力してください"
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