from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#09Reactから呼ぶ準備:CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],#本番環境では実際のフロントエンドURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#ダミーデータてきな
students = [
    {
        "student_id": "2472124",
        "name": "やまだ",
        "card_id": "11001100",
        "grade": "B3",
    },
    {
        "student_id": "2300000",
        "name": "たなか",
        "card_id": "11111111",
        "grade": "M1",
    }
]

attendances = []

#学生登録
class PostStudents(BaseModel):
    student_id: str
    name: str
    card_id: str
    grade: str

#学生情報修正用
class StudentUpdate(BaseModel):
    name:str | None = None
    grade:str | None = None

class AttendanceUpdate(BaseModel):
    status:int | None = None

#打刻
class Punch(BaseModel):
    card_id: str

#学生登録
@app.post("/students")
def post_students(data:PostStudents):
    students.append(
        {
            "student_id":data.student_id,
            "name":data.name,
            "card_id":data.card_id,
            "grade":data.grade,
        }
    )

#学生一覧
@app.get("/students")
def get_students():
    return students

#カードIDで打刻
@app.post("/punch")
def punch(data:Punch):
    for i in students:
        if i["card_id"] == data.card_id:
            new_status = 1
            for j in reversed(attendances):
                if i["student_id"] == j["student_id"]:
                    #0=退室、1=入室
                    if j["status"] == 0:
                        new_status = 1
                    else:
                        new_status = 0
                    break
            attendances.append(
                    {
                            "id": len(attendances)+1,
                            "student_id": i["student_id"],
                            "status": new_status,
                        }
                )
            return {"studentName":i["name"],"status":new_status}
    raise HTTPException(status_code=404,detail="Card not found")

#打刻一覧
@app.get("/attendances")
def get_attendances():
    return attendances

#reactに返す用
@app.get("/students/status")
def get_member_status():
    result = []

    for i in students:
        status = 0
        for j in reversed(attendances):
            if i["student_id"] == j["student_id"]:
                status = j["status"]
                break
        result.append(
            {
                "student_id": i["student_id"],
                "name": i["name"],
                "status": status,
                "grade": i["grade"],
            }
        )
    return result

#カードから学生情報取得
def find_student_by_card(card_id:str):
    for i in students:
        if i["card_id"] == card_id:
            return i
    raise HTTPException(status_code=404, detail="Student not found")

@app.get("/students/card/{card_id}")
def get_student_by_card(card_id:str):
    student = find_student_by_card(card_id)
    return student

#学生修正
@app.patch("/students/card/{card_id}")
def update_student(card_id:str,data:StudentUpdate):
    current = find_student_by_card(card_id)
    changes = data.model_dump(exclude_unset=True)
    current.update(changes)
    return current

#打刻修正
def find_punch(id:int):
    for i in attendances:
        if i["id"] == id:
            return i
    raise HTTPException(status_code=404,detail="ID not found")

@app.patch("/attendances/{id}")
def update_attendance(id:int,data:AttendanceUpdate):
    current = find_punch(id)
    changes = data.model_dump(exclude_unset=True)
    current.update(changes)
    return current


#学生削除
def find_student(student_id:str):
    for i in students:
        if i["student_id"] == student_id:
            return i
    raise HTTPException(status_code=404,detail="Student not found")

@app.delete("/students/{student_id}")
def delete_student(student_id:str):
    current = find_student(student_id)
    students.remove(current)

#打刻削除
@app.delete("/attendances/{id}")
def delete_punch(id: int):
    current = find_punch(id)
    attendances.remove(current)