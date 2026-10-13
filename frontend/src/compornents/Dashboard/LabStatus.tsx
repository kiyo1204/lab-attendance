import { useState, useEffect } from "react"


export default function LabStatus() {
    const [status, setStatus] = useState("不明")
    
    useEffect(() => {
        const currentStatus = localStorage.getItem("status")
        if (currentStatus === null){
            return
        } else {
            setStatus(currentStatus)
        }
    }, [])

    return (
        <section className="lab-status-card">
            <h2>研究室の状況</h2>

            <p className="lab-status">
                {status}
            </p>
        </section>
    )
}