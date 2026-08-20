import type { Todo } from "../types/todo"
import { TodoItem } from "./TodoItem"

type TodoListProps = {
    todos: Todo[]
    onToggle: (id: string) => void
    onRemove: (id: string) => void
}

export function TodoList(props: TodoListProps) {
    if (props.todos.length === 0) return <p>該当するToDoはありません</p>

    return <ul className="todo-list">{props.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo}
        onToggle={props.onToggle} onRemove={props.onRemove} />
    ))}</ul>
}