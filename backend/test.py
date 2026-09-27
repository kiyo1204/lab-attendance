from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


# ==========================================
# Reactから呼ぶ準備：CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ダミーデータ
# ==========================================

students = [
    {
        "student_id": "24G2124",
        "name": "やまだ",
        "card_id": "11001100",
        "grade": "B3",
    },
    {
        "student_id": "23A000",
        "name": "たなか",
        "card_id": "11111111",
        "grade": "M1",
    }
]


attendances = []


# ==========================================
# Pydanticモデル
# ==========================================

# 学生登録
class PostStudents(BaseModel):
    student_id: str
    name: str
    card_id: str
    grade: str


# ★追加
# 学生情報編集
class StudentUpdate(BaseModel):
    student_id: str | None = None
    name: str | None = None
    card_id: str | None = None
    grade: str | None = None


# ★追加
# 編集画面でカードIDから学生を検索
class CardLookup(BaseModel):
    card_id: str


# 打刻修正
class AttendanceUpdate(BaseModel):
    status: int | None = None


# 打刻
class Punch(BaseModel):
    card_id: str


# ==========================================
# 学生登録
# ==========================================

@app.post("/students")
def post_students(data: PostStudents):

    # 学籍番号の重複確認
    for student in students:
        if student["student_id"] == data.student_id:
            raise HTTPException(
                status_code=409,
                detail="Student ID already exists"
            )

    # カードIDの重複確認
    for student in students:
        if student["card_id"] == data.card_id:
            raise HTTPException(
                status_code=409,
                detail="Card already registered"
            )

    new_student = {
        "student_id": data.student_id,
        "name": data.name,
        "card_id": data.card_id,
        "grade": data.grade,
    }

    students.append(new_student)

    return {
        "message": "Student registered",
        "student": new_student,
    }


# ==========================================
# 学生一覧
# ==========================================

@app.get("/students")
def get_students():
    return students


# ==========================================
# 学生検索
# ==========================================

def find_student(student_id: str):

    for student in students:

        if student["student_id"] == student_id:
            return student

    raise HTTPException(
        status_code=404,
        detail="Student not found"
    )


# ==========================================
# ★追加
# 学生情報編集用
# カードIDから学生情報を取得
# ==========================================

@app.post("/students/edit/lookup")
def lookup_student_by_card(data: CardLookup):

    for student in students:

        if student["card_id"] == data.card_id:

            return {
                "student_id": student["student_id"],
                "name": student["name"],
                "card_id": student["card_id"],
                "grade": student["grade"],
            }

    raise HTTPException(
        status_code=404,
        detail="Card not found"
    )


# ==========================================
# ★追加
# 学生情報変更
# ==========================================

@app.patch("/students/{student_id}")
def update_student(
    student_id: str,
    data: StudentUpdate
):

    # URLのstudent_idは「変更前」の学籍番号
    current = find_student(student_id)

    # Reactから送られてきた項目だけ取得
    changes = data.model_dump(
        exclude_unset=True
    )


    # ------------------------------------------
    # 学籍番号を変更する場合
    # ------------------------------------------

    if "student_id" in changes:

        new_student_id = changes["student_id"]

        # 他の学生と重複していないか確認
        for student in students:

            if (
                student is not current
                and
                student["student_id"] == new_student_id
            ):
                raise HTTPException(
                    status_code=409,
                    detail="Student ID already exists"
                )

        old_student_id = current["student_id"]

        # 過去の打刻データのstudent_idも変更する
        for attendance in attendances:

            if attendance["student_id"] == old_student_id:

                attendance["student_id"] = new_student_id


    # ------------------------------------------
    # カードIDを変更する場合
    # ------------------------------------------

    if "card_id" in changes:

        new_card_id = changes["card_id"]

        # 他の学生が同じカードを使っていないか確認
        for student in students:

            if (
                student is not current
                and
                student["card_id"] == new_card_id
            ):
                raise HTTPException(
                    status_code=409,
                    detail="Card already registered"
                )


    # ------------------------------------------
    # 学生情報を更新
    # ------------------------------------------

    current.update(changes)

    return {
        "message": "Student updated",
        "student": current,
    }


# ==========================================
# カードIDで打刻
# ==========================================

@app.post("/punch")
def punch(data: Punch):

    for student in students:

        if student["card_id"] == data.card_id:

            # 初回は入室
            new_status = 1

            # 最新の打刻履歴を確認
            for attendance in reversed(attendances):

                if (
                    student["student_id"]
                    == attendance["student_id"]
                ):

                    # 0 = 退室
                    # 1 = 入室

                    if attendance["status"] == 0:
                        new_status = 1

                    else:
                        new_status = 0

                    break


            # 新しい打刻情報を追加
            new_attendance = {
                "id": len(attendances) + 1,
                "student_id": student["student_id"],
                "status": new_status,
            }

            attendances.append(new_attendance)


            return {
                "name": student["name"],
                "student_id": student["student_id"],
                "status": new_status,
            }


    raise HTTPException(
        status_code=404,
        detail="Card not found"
    )


# ==========================================
# 打刻一覧
# ==========================================

@app.get("/attendances")
def get_attendances():

    return attendances


# ==========================================
# Reactに返す在室状況
# ==========================================

@app.get("/students/status")
def get_member_status():

    result = []

    for student in students:

        # 初期状態は退室
        status = 0


        # 最新の打刻を探す
        for attendance in reversed(attendances):

            if (
                student["student_id"]
                == attendance["student_id"]
            ):

                status = attendance["status"]

                break


        result.append(
            {
                "student_id": student["student_id"],
                "name": student["name"],
                "status": status,
                "grade": student["grade"],
            }
        )


    return result


# ==========================================
# 打刻検索
# ==========================================

def find_punch(id: int):

    for attendance in attendances:

        if attendance["id"] == id:

            return attendance


    raise HTTPException(
        status_code=404,
        detail="ID not found"
    )


# ==========================================
# 打刻修正
# ==========================================

@app.patch("/attendances/{id}")
def update_attendance(
    id: int,                       # ★修正 str → int
    data: AttendanceUpdate
):

    current = find_punch(id)

    changes = data.model_dump(
        exclude_unset=True
    )


    # statusは0または1だけ
    if "status" in changes:

        if changes["status"] not in [0, 1]:

            raise HTTPException(
                status_code=400,
                detail="status must be 0 or 1"
            )


    current.update(changes)


    return {
        "message": "Attendance updated",
        "attendance": current,
    }


# ==========================================
# 学生削除
# ==========================================

@app.delete("/students/{student_id}")
def delete_student(student_id: str):

    current = find_student(student_id)

    students.remove(current)


    return {
        "message": "Student deleted"
    }


# ==========================================
# 打刻削除
# ==========================================

@app.delete("/attendances/{id}")
def delete_punch(id: int):

    current = find_punch(id)

    attendances.remove(current)


    return {
        "message": "Attendance deleted"
    }