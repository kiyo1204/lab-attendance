import { Link } from "react-router-dom"

import backImage from "../img/back.png"
import "../EditAccount/CSS/style.css"
import EditForm from "./editForm"

function EditAccount() {
    return (
        <main className="register">
            <header className="register-header">
                <h1>状況変更</h1>
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