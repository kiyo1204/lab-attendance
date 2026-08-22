export type MemberStatus =
    | "在室"
    | "欠席"

export type Member = {
    id: number
    name: string
    status: MemberStatus
}

export type LabStatus =
    | "ゼミ中"
    | "空いてます"