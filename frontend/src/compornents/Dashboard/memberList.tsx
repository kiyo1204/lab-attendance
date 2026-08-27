import { useEffect, useState } from "react"
//import { members } from "../../data/members"
import StatusBadge from "./StatusBadge"


const MemberList = () => {
    const [members, setMembers] = useState([])
    const [error, setError] = useState("")

    useEffect( () => {
        fetch("http://127.0.0.1:8080/students").then( (res) => {
            if (!res.ok) throw new Error ("HTTP ${res.status}")
            return res.json()
        })
        .then(setMembers)
        .catch( (e) => setError(e.message))
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
                <div className="member-header">
                    <span>氏名</span>
                    <span>在室状況</span>
                </div>

                {members.map((member) => (
                    <div className="member-row" key={member.student_id}>
                        <span>{member.name}</span>
                        <StatusBadge status={member.status} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MemberList