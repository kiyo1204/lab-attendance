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
        "studentId": 2472124,
        "name": "やまだ",
        "card_id": 11001100,
        "grade": "B3",
    },
    {
        "studentId": 2300000,
        "name": "たなか",
        "card_id": 11111111,
        "grade": "M1",
    }
]

attendances = []

#学生登録
class PostStudents(BaseModel):
    studentId:int
    studentName:str
    cardId:int
    grade:str


class AttendanceUpdate(BaseModel):
    status:int | None = None

#打刻
class Punch(BaseModel):
    cardId:int

#学生登録
@app.post("/students")
def post_students(data:PostStudents):
    students.append(
        {
            "student_id":data.studentId,
            "name":data.studentName,
            "card_id":data.cardId,
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
        if i["card_id"] == data.cardId:
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
                "name": i["name"],
                "status": status,
                "grade": i["grade"],

            }
        )
    return result

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

#学生削除 mate


#打刻削除
@app.delete("/attendances/{id}")
def delete_punch(id: int):
    current = find_punch(id)
    attendances.remove(current)