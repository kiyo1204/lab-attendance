import { Link } from "react-router-dom"
import InputArea from "./InputArea"

import backImage from "../img/back.png"
import "./CSS/style.css"

function Register() {
    return (
        <main className="register">
            <header className="register-header">
                <h1>登録</h1>
                <Link to="/">
                    <button className="menuButton">
                        <img src={backImage} alt="" />
                    </button>
                </Link>
            </header>
            
            <div className="area-position">
                <InputArea />
            </div>
        </main>
    )
}

export default Register