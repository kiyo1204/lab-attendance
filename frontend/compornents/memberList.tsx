import { members } from "../data/members"
import StatusBadge from "./StatusBadge"

const MemberList = () => {
    return (
        <section className="member-card">
            <h2>研究室メンバー</h2>

            <div className="member-table">
                <div className="member-header">
                    <span>氏名</span>
                    <span>在籍状況</span>
                </div>

                { members.map((member) => (
                    <div className="member-row" key={member.id}>
                        <span>{member.name}</span>
                        <StatusBadge status={member.status} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MemberList