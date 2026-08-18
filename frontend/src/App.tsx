// FormEvent: イベント対象がformであることを型で示す
import { useEffect, useState, type FormEvent } from "react"
import type { Filter, Todo } from "./types/todo"

// Appコンポーネントを定義
function App(){
  // 変更しない変数の定義
  // title=現在値, setTitle=更新関数, ("")=初期値
  const [title, setTitle] = useState("")
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos")
    if(!saved) return []
    
    try{
      return JSON.parse(saved) as Todo[]
    }catch{
      return []
    }
  })
  const [filter, setFilter] = useState<Filter>("all")
  
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // 通常のフォーム送信によるページ再読み込みを止める
    event.preventDefault()
    // trim: 空白だけの入力を空文字として扱う
    const cleanTitle = title.trim()
    // 不正入力なら早期returnを行い，正常系の入れ子を減らす
    if (!cleanTitle) return

    // 新しいタスクを作成する関数
    const newTodo: Todo = {
      // crypto.randomUUID: 配列要素を追跡する安定したidを作る
      id: crypto.randomUUID(),
      title: cleanTitle,
      completed: false,
    }

    // [...curent...]: 元配列を変更せずに新しい配列を作成
    setTodos((currentTodos) => [...currentTodos, newTodo])
    // 追加成功後に入力欄を空に戻す
    setTitle("")
  }

  // 完了状態の切り替えを行う関数
  const toggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      // 要素数を保ったまま各要素を変換する
      currentTodos.map((todo) =>
        // クリックされたTodoだけを見つける
        todo.id === id
          // 既存プロパティをコピーし，completedだけ上書き(!でTrueとFalseを反転)
          ? {...todo, completed: !todo.completed }
          : todo,
      ),
    )
  }

  // タスクの削除を行う関数
  const removeTodo = (id: string) => {
    setTodos((currentTodos) =>
      // 指定id以外だけを残して，対象を削除する
      currentTodos.filter((todo) => todo.id !== id),
    )
  }

  // 
  const visibleTodos = todos.filter((todo) =>{
    if (filter === "activate") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const remainingCount = todos.filter((todo) => !todo.completed).length

  // 表示するJSXを返す
  return(
    <main>
      <h1>ToDo</h1>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="todo-title">新しいToDo</label>
        <div>
          <input
            id="todo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="やることを入力"
          />
          <button type="submit">追加</button>
        </div>
      </form>

      <div aria-label="表示フィルター">
        <button type="button" onClick={() => setFilter("all")}>すべて</button>
        <button type="button" onClick={() => setFilter("activate")}>未完了</button>
        <button type="button" onClick={() => setFilter("completed")}>完了</button>
      </div>
      <p>残り {remainingCount}件</p>

      {/* 「条件 ? A: B:」: 配列が空なら説明文，そうでなければulを表示 */}
      {todos.length === 0 ? (
        <p>まだToDoはありません．</p>
      ) : (
        <ul>
          {/* todos.map(...): 各Todoをli要素へと変換する．Pythonのリスト内包表記に近い */}
          {visibleTodos.map((todo) => (
            // key=...: 並びの各要素をReactが識別するための値．表示には使われないprop
            <li key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.title}</span>
              </label>
              <button type="button" onClick={() => removeTodo(todo.id)}>削除</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

// 他ファイルから利用可能にする
export default App