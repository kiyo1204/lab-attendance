import "./index.css"

import LabStatus from "./compornents/LabStatus"
import MemberList from "./compornents/memberList"

function App() {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>
          研究室 出席管理ダッシュボード
        </h1>
      </header>

      <LabStatus />

      <MemberList />

    </main>
  )
}

export default App