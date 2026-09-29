export type MemberStatus = "在室" | "退室"

export type Member = {
    id: number
    student_id: string
    grade: string
    name: string
    status: MemberStatus
}

export type LabStatus = "ゼミ中" | "空いてます"
