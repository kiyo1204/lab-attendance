import { Link } from "react-router-dom"
import InputArea from "./InputArea"

function Register() {
    return (
        <main className="register">
            <header className="register-header">
                <h1>登録</h1>
                <Link to="/">
                    <button>戻る</button>
                </Link>
            </header>

            <InputArea />
            
        </main>
    )
}

export default Register