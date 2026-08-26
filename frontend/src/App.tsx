import "./index.css"

import { Route, Routes } from "react-router-dom"

import Dashboard from "./compornents/Dashboard/Dashboard"
import Registar from "./compornents/Registar/Registar"

function App() {
  return (
    <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registar" element={<Registar />} />
    </Routes>
  )
}

export default App