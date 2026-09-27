import { useState } from "react"

const LabStatus = () => {
    const [status, setStatus] = useState("不明")

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