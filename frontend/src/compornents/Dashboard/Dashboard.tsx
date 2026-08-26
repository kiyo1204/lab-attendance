import { Link } from "react-router-dom"

import LabStatus from "./LabStatus"
import MemberList from "./memberList"

function Dashboard() {
    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <h1>
                研究室 出席管理ダッシュボード
                </h1>
            <Link to="/registar">
                <button className="registar-button">登録</button>
            </Link>
        </header>

        <LabStatus />

        <MemberList />

        </main>
    )
}

export default Dashboard