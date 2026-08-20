import { useState, type FormEvent } from "react"

type TodoFormProps = {
    onAdd: (title: string) => void
}

export function TodoForm({onAdd}: TodoFormProps){
    const [title, setTitle] = useState("")

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const cleanTitle = title.trim()
        if(!cleanTitle) return

        onAdd(cleanTitle)
        setTitle("")
    }

    return(
        <form className="todo-form" onSubmit={handleSubmit}>
            <label htmlFor="todo-title">新しいToDo</label>
            <div className="todo-form_row">
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="やることを入力"
                />
                <button type="submit">追加</button>
            </div>
        </form>
    )
}