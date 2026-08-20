import type{Todo} from "../types/todo"

type TodoItemProps = {
    todo: Todo
    onToggle: (id: string) => void
    onRemove: (id: string) => void
}

export function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
    return (
        <li className="todo-item">
            <label>
                <input type="checkbox" checked={todo.completed}
                    onChange={() => onToggle(todo.id)}
                />
                <span className={todo.completed ? "todo-item__title--done" : ""}>
                    {todo.title}
                </span>
            </label>
            <button type="button" className="danger"
                onClick={() => onRemove(todo.id)}>削除</button>
        </li>
    )
}