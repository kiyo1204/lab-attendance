import { useEffect, useState } from "react"
//import { members } from "../../data/members"
import StatusBadge from "./StatusBadge"
import type { MemberStatus } from "../../types"

type Student = {
    studentId: string
    grade: string
    name: string
    status: string
}

const MemberList = () => {
    const [members, setMembers] = useState<Student[]>([])
    const [error, setError] = useState("")

    useEffect( () => {
        fetch("http://127.0.0.1:8000/students").then( (res) => {
            if (!res.ok) throw new Error ("HTTP ${res.status}")
            return res.json()
        }).then(setMembers).catch( (e) => setError(e.message))
    }, [])

    if (error) return (
        <div className="error">
            <p>{error}: バックエンドサーバが起動していません</p>
        </div>
    )
    return (
        <section className="member-card">
            <h2>研究室メンバー</h2>

            <div className="member-table">
                {[0, 1].map((column) => (
                <div className="member-column" key={column}>
                    <div className="member-header">
                        <span>氏名</span>
                        <span>学年</span>
                        <span>在室状況</span>
                    </div>

                    {members.filter((_, index) => index % 2 === column).map((member) => {
                    const convertStatus: MemberStatus =
                        member.status === "1" ? "在室" : "退室"

                    return (
                        <div className="member-row" key={member.studentId}>
                            <span>{member.name}</span>
                            <span>{member.grade}</span>
                            <StatusBadge status={convertStatus} />
                        </div>
                        )
                    })}
                </div>
            ))}
            </div>
        </section>
    )
}

export default MemberList
