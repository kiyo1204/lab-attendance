import type { MemberStatus } from "../../types"

type Props = {
    status: MemberStatus
}

const statusClassMap: Record<MemberStatus, string> = {
    在室: "present",
    退室: "absent",
}

const StatusBadge = ({ status }: Props) => {
    return <span className={`status-badge ${statusClassMap[status]}`}>{status}</span>
}

export default StatusBadge