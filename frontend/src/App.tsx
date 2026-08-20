import { useEffect, useState } from "react"
import { TodoForm } from "./compornents/TodoForm"
import { TodoList } from "./compornents/TodoList"
import type { Filter, Todo } from "./types/todo"

const STORAGE_KEY = "react-ts-primer.todos"

// ブラウザにデータが保存されていたらロード(コンポーネント外のため，定義は一回のみ)
function loadTodos(): Todo[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved) as Todo[]
  } catch {
    return []
  }
}


function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos) // 初期化処理としてloadTodos関数が渡されている(loadTodos()とは別)
  const [filter, setFilter] = useState<Filter>("all")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(), title, completed: false,
    }
    setTodos((current) => [...current, newTodo])
  }

  const toggleTodo = (id: string) => {
    setTodos((current) => current.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed }: todo,
    ))
  }

  const removeTodo = (id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  const visibleTodos = todos.filter((todo) => {
    if (filter === "activate") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })
  const remainingCount = todos.filter((todo) => !todo.completed).length

  return (
    <main className="app">
      <header><p className="eyebrow">React + TypeScript</p><h1>My ToDo</h1></header>
      <TodoForm onAdd={addTodo} />
      <nav className="filters" aria-label="表示フィルター">
        {(["all", "activate", "completed"] as Filter[]).map((value) => (
          <button key={value} type="button"
            className={filter === value ? "is-active" : ""}
            onClick={() => setFilter(value)}>
              {{ all: "すべて", activate: "未完了", completed: "完了" }[value]}
            </button>
        ))}
      </nav>
      <TodoList todos={visibleTodos} onToggle={toggleTodo} onRemove={removeTodo} />
      <footer>残り {remainingCount} 件 / 全 {todos.length} 件</footer>
    </main>
  )
}

export default App