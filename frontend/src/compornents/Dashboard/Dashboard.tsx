import { Link } from "react-router-dom"
import { useState } from "react"

import LabStatus from "./LabStatus"
import MemberList from "./MemberList"
import menuImage from "../img/menu.png"
import "./CSS/style.css"

function Dashboard() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <h1>
                研究室 出席管理ダッシュボード
                </h1>
            <button
                className="menuButton"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label="メニュー"
                >
                <img src={menuImage} alt="" />
            </button>

            <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
                <ul>
                    <li><Link to="/register">登録</Link></li>
                    <li>情報変更</li>
                </ul>
            </nav>
        </header>

        <LabStatus />

        <MemberList />

        </main>
    )
}

export default Dashboard