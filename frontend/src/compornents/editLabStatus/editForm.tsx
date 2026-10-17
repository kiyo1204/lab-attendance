import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import "../EditAccount/CSS/style.css"


export default function EditForm() {
    // 名前，学年，学籍番号
    const [labStatus, setLabStatus] = useState("")
    const [status, setStatus] = useState("")

    useEffect(() => {
        const currentStatus = localStorage.getItem("status")
        if (currentStatus === null) {
            setLabStatus("不明")
        } else {
            setLabStatus(currentStatus)
        }
    }, [])

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        if ( !labStatus.trim() ) {
            setStatus("現在の研究室の状況を入力してください")
            return
        }

        try {
            // 更新処理
            localStorage.setItem("status", labStatus)

            setStatus("更新しました")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <main className="edit-card">

            <h2 className="section-title">研究室状況変更</h2>

            <div className="divider"></div>

            {/* 編集フォーム */}
            <form className="update-form" onSubmit={handleSubmit}>
            
            {/* 入力欄 */}
            <div className="form-row">
                <label htmlFor="status">現在の状況</label>
                <div className="form-control">
                    <input
                        id="status"
                        type="text"
                        value={labStatus}
                        onChange={(e) => setLabStatus(e.target.value)}
                    />
                </div>
            </div>

            <p>{status}</p>


            <div className="divider"></div>

            <div className="actions">
                <button 
                    type="submit"
                    className="save-button"
                >
                    保存
                </button>
            </div>
        </form>
    </main>

    )
}