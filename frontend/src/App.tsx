import "./index.css"

import { Route, Routes } from "react-router-dom"

import Dashboard from "./compornents/Dashboard/Dashboard"
import Register from "./compornents/Register/Register"

function App() {
  return (
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App