import { useEffect, useRef, useState } from "react"
import StatusBadge from "./StatusBadge"
import type { MemberStatus, Member } from "../../types"
import { connectReader, pollingReader, sleep } from "../connectReader/connect"

const MemberList = () => {
    const [members, setMembers] = useState<Member[]>([])

    const [error, setError] = useState("")

    const [readerStatus, setReaderStatus] = useState("リーダー接続中...")

    const loadMembers = async () => {
        const res = await fetch("http://127.0.0.1:8000/students/status")

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        setMembers(data)
    }

    useEffect(() => {
        loadMembers().catch((e) => {
            setError(e.message)
        })
    }, [])

    useEffect(() => {
        let cancelled = false

        const startReader = async () => {
            try {
                console.log("カードリーダー処理開始")

                await connectReader()

                if (cancelled) {
                    return
                }

                setReaderStatus("カードをタッチしてください")

                while (!cancelled) {
                    const result = await pollingReader(1)

                    if (cancelled) {
                        console.log("polling後にcancelled")
                        break
                    }

                    if (!result?.idm) {
                        await sleep(300)
                        continue
                    }

                    const card_id = result.idm

                    console.log("カード検出:", card_id)

                    setReaderStatus("打刻中...")

                    const res = await fetch(
                        "http://127.0.0.1:8000/punch",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                card_id: card_id.trim(),
                            }),
                        }
                    )

                    if (cancelled) {
                        break
                    }

                    if (!res.ok) {
                        const text = await res.text()

                        console.error("打刻失敗:", text)

                        setReaderStatus("打刻に失敗しました")

                        await sleep(1000)

                        if (!cancelled) {
                            setReaderStatus(
                                "カードをタッチしてください"
                            )
                        }

                        continue
                    }

                    const data = await res.json()

                    if (cancelled) {
                        break
                    }

                    console.log("打刻成功:", data)

                    if (data.status === 1) {
                        setReaderStatus(
                            `${data.name}さん 入室しました`
                        )
                    } else {
                        setReaderStatus(
                            `${data.name}さん 退室しました`
                        )
                    }

                    await loadMembers()

                    await sleep(1500)

                    if (!cancelled) {
                        setReaderStatus(
                            "カードをタッチしてください"
                        )
                    }
                }
            } catch (error) {
                console.error("リーダーエラー:", error)

                if (!cancelled) {
                    setReaderStatus(
                        "カードリーダーへの接続許可が必要です"
                    )
                }
            }
        }

        startReader()

        return () => {
            console.log("MemberList cleanup")
            cancelled = true
        }
    }, [])

    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
            </div>
        )
    }
    
    return (
        <section className="member-card">
            <h2>研究室メンバー</h2>

            <p>{readerStatus}</p>

            <div className="member-table">
                {[0, 1].map((column) => (
                    <div className="member-column" key={column}>
                        <div className="member-header">
                            <span>氏名</span>
                            <span>学年</span>
                            <span>在室状況</span>
                        </div>

                        {
                            members.filter( (_, index) => index % 2 === column).map((member) => {
                                const convertStatus:
                                    MemberStatus =
                                    member.status === 1
                                        ? "在室"
                                        : "退室"

                                return (
                                    <div className="member-row" key={member.student_id}>
                                        <span>{member.name}</span>

                                        <span>{member.grade}</span>

                                        <StatusBadge status={convertStatus} />
                                    </div>
                                )
                            })
                        }
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MemberList