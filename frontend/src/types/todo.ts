// Todoという型を公開
export type Todo = {
    // 一意な識別子
    id: string
    // 利用者が入力した内容
    title: string
    // 完了状態
    completed: boolean
}

// "all" |... は3種類だけ許すUnion型(スペルミスをコンパイル時に防げる)
export type Filter = "all" | "activate" | "completed"