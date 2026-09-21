import "./index.css"

import { Route, Routes } from "react-router-dom"

import Dashboard from "./compornents/Dashboard/Dashboard"
import Register from "./compornents/Register/Register"
import EditAccount from "./compornents/EditAccount/editAccount"

function App() {
  return (
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit" element={<EditAccount />} />
    </Routes>
  )
}

export default App