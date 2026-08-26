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
        "student_id": 2472124,
        "name": "やまだ",
        "card_id": 11001100
    },
    {
        "student_id": 2300000,
        "name": "たなか",
        "card_id": 11111111
    }
]

attendances = []

#学生登録あとで
class PostStudents(BaseModel):
    studentId:int
    studentName:str
    cardId:int

#打刻
class PunchUpdate(BaseModel):
    Status:int | None = None
class Punch(BaseModel):
    cardId:int

#学生登録あとでやる
@app.post("/students")
def post_students(data:PostStudents):
    students.append(
        {
            "student_id":data.studentId,
            "name":data.studentName,
            "card_id":data.cardId
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
                            #"punched_at":あとでしらべる
                        }
                )
            return {"studentName":i["name"],"status":new_status}
    raise HTTPException(status_code=404,detail="Card not found")

#打刻一覧
@app.get("/attendances")
def get_attendances():
    return attendances

#打刻修正

def find_punch(id:int) -> Punch:
    attendance = attendance.get(id)
    if attendance is None:
        raise HTTPException(status_code=404,detail="Task not found")
    return attendance

@app.patch("/attendances/{id}",response_mosel=Punch)
def update_punch(id:int,data:PunchUpdate):
    current = find_punch(id)
    changes = data.model_dump(exclude_unset=True)
    
#打刻削除
#あとで