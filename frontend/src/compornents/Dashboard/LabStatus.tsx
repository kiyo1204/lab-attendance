import { useEffect, useState } from "react"

const LabStatus = () => {
    const [status, setStatus] = useState("不明")
    const [error, setError] = useState("")

    useEffect ( () => {
        fetch("http://127.0.0.1:8000/labStatus").then( (res) => {
            if(!res.ok) throw new Error("HTTP ${res.status}")
            return res.json()
        }).then(setStatus).catch( (e) => setError(e.message) )
        }, [])

    if (error) return (
        <div className="error">
            <p>{error}: バックエンドサーバが起動していません</p>
        </div>
    )

    return (
        <section className="lab-status-card">
            <h2>研究室の状況</h2>

            <p className="lab-status">
                {status}
            </p>
        </section>
    )
}

export default LabStatus