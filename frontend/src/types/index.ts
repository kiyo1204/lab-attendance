export type MemberStatus =
    | "在室"
    | "退室"

export type Member = {
    student_id: string
    grade: string
    name: string
    status: number
}