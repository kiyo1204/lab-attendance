import { useRef, useState, useEffect } from "react"
import type { FormEvent } from "react"
import "./CSS/style.css"

import { connectReader, waitForCard } from "../connectReader/connect"

export default function EditForm() {
    // 名前，学年，学籍番号
    const [name, setName] = useState("")
    const [course, setCourse] = useState("")
    const [grade, setGrade] = useState("")
    const [studentNumber, setStudentNumber] = useState("")
    const [cardId, setCardId] = useState("")

    const [status, setStatus] = useState("")
    const [isWaiting, setIsWaiting] = useState(false)

    const cancelledRef = useRef(false)
    useEffect(() => {
        cancelledRef.current = false

        return () => {
            cancelledRef.current = true
        }
    }, [])

    const Lookup = async () => {
        try {
            setIsWaiting(true)
            console.log("カードリーダー自動接続")

            await connectReader()

            const card_id = await waitForCard(
            () => cancelledRef.current
            )

            if (!card_id) {
                return
            }

            console.log("カード検出:", card_id)

            const res = await fetch(`http://127.0.0.1:8000/students/card/${card_id}`,
                {
                    method: "GET"
                }
            )

            if (!res.ok) {
                const text = await res.text()

                console.error("参照失敗:", text)

            } else {
                const data = await res.json()
                console.log("取得完了:", data)

                setName(data.name)
                setCourse(data.grade[0])
                setGrade(data.grade[1])
                setStudentNumber(data.student_id)
                setCardId(card_id)

                setIsWaiting(false)
            }
        } catch (error) {
            console.error("リーダーエラー:", error)
        } finally {
            if (!cancelledRef.current) {
                setIsWaiting(false)
            }
        }
    }

    // 新しいカードIDだけ読み取る
    const handleChangeCard = async () => {
        try {
            setIsWaiting(true)
            setStatus("新しいカードをタッチしてください")

            await connectReader()

            const newCardId = await waitForCard(
                () => cancelledRef.current
            )

            if (!newCardId) {
                return
            }

            setCardId(newCardId)

            setStatus("新しいカードを読み取りました．保存ボタンを押してください")
        } catch (error) {
            console.error(error)

            if (!cancelledRef.current) {
                setStatus("カードの読み取りに失敗しました")
            }
        } finally {
            if (!cancelledRef.current) {
                setIsWaiting(false)
            }
        }
    }

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        if (
            !name.trim() ||
            !studentNumber.trim() ||
            !course ||
            !grade
        ) {
            setStatus(
                "名前，学年，学籍番号を入力してください"
            )
            return
        }

        try {
            setIsWaiting(true)

            await connectReader()

            setStatus("新しいカードをタッチしてください")

            const card_id = await waitForCard(
                () => cancelledRef.current
            )

            if (!card_id) {
                return
            }

            setStatus("カードを読み取りました．更新中...")

            const response = await fetch(
                `http://127.0.0.1:8000/students/card/${card_id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        student_id: studentNumber.trim(),
                        name: name.trim(),
                        card_id: card_id.trim(),
                        grade: `${course}${grade}`,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error("更新に失敗しました")
            }

            setCardId(card_id)

            setStatus("更新しました")
        } catch (error) {
            console.error(error)

            if (!cancelledRef.current) {
                setStatus("更新に失敗しました")
            }
        } finally {
            if (!cancelledRef.current) {
                setIsWaiting(false)
            }
        }
    }

    return (
        <main className="edit-card">
            {/* カード選択 */}
            <section className="lookup-section">
                <button 
                    type="button"
                    className="lookup-button"
                    onClick={() => Lookup()}    
                >
                    <span className="lookup-icon">アイコン</span>
                    編集したいカードをタッチ
                </button>
                <p className="lookup-description">
                    カードをタッチして学生情報を読み込み，必要な項目だけ変更してください．
                </p>
            </section>

            <h2 className="section-title">情報変更</h2>

            {/* 成功表示 */}
            <div className="success-message">
                <span className={`${name ? "successs": "none"}-icon`}>{name ? "✓" : "✖"}</span>
                {name ? "カードを読み取りました" : "カードを読み込んでください"}
            </div>

            <div className="divider"></div>

            {/* 編集フォーム */}
            <form className="update-form" onSubmit={handleSubmit}>
            
            {/* 名前 */}
            <div className="form-row">
                <label htmlFor="name">
                    名前
                </label>

                <div className="form-control">
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isWaiting}
                        pattern="[^0-9０-９]+"
                        title="数字以外を入力してください"
                        required
                    />
                </div>
            </div>

            {/* 学年 */}
            <div className="form-row">
                <label>
                    学年
                </label>

                <div className="form-control grade-group">
                    <select 
                        aria-label="課程"
                        onChange={(e) => setCourse(e.target.value)}
                        value={course}
                        disabled={isWaiting}
                        required
                    >
                        <option value="B" selected>B</option>
                        <option value="M">M</option>
                        <option value="D">D</option>
                    </select>

                    <select
                        aria-label="学年"
                        onChange={(e) => setGrade(e.target.value)}
                        value={grade}
                        disabled={isWaiting}
                        required
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3" disabled={course==="M"}>3</option>
                        <option value="4" disabled={course==="M"}>4</option>
                    </select>
                </div>
            </div>

            {/* 学籍番号 */}
            <div className="form-row">
                <label>
                    学籍番号
                </label>

                <div className="form-control readonly-row">
                    <div className="readonly-wrapper">
                        <span className="lock-icon">🔒</span>
                        <input
                            type="text"
                            value={studentNumber}
                            readOnly
                        />
                    </div>

                    <span className="readonly-note">
                        変更できません
                    </span>
                </div>
            </div>

            {/* 現在のカードID */}
            <div className="form-row">
                <label>
                    現在のカードID
                </label>

                <div className="form-control">
                    <input
                        className="readonly-input"
                        type="text"
                        value={cardId}
                        readOnly
                    />
                </div>
            </div>

            <div className="divider"></div>

            {/* カード変更 */}
            <section className="card-change-box">
                <div className="card-change-text">
                    <h3>カードの変更(必要な場合のみ)</h3>
                    <p>カードを変更する場合のみ，新しいカードをタッチしてください．</p>
                </div>

                <button 
                    type="button"
                    className="change-card-button"
                    onClick={handleChangeCard}
                >
                    新しいカードをタッチ
                </button>
            </section>

            <div className="actions">
                <button 
                    type="submit"
                    className="save-button"
                    disabled={
                        isWaiting || !studentNumber
                    }
                >
                    保存
                </button>
            </div>
        </form>
    </main>

    )
}