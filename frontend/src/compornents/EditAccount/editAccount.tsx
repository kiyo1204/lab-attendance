import { Link } from "react-router-dom"

import backImage from "../img/back.png"
import "./CSS/style.css"
import EditForm from "./edit"

function EditAccount() {
    return (
        <main className="register">
            <header className="register-header">
                <h1>情報変更</h1>
                <Link to="/">
                    <button className="menuButton">
                        <img src={backImage} alt="" />
                    </button>
                </Link>
            </header>
                <EditForm />
            <div className="area-position">

            </div>
        </main>
    )
}

export default EditAccount