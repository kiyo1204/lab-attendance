from datetime import datetime
from pydantic import BaseModel, ConfigDict

#学生登録
class PostStudents(BaseModel):
    student_id: str
    name: str
    card_id: str
    grade: str

# 返却用
class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: str
    name: str
    card_id: str
    grade: str

class StudentStatusResponse(BaseModel):
    student_id: str
    name: str
    status: int
    grade: str

class AttendanceResponse(BaseModel):
    id: int
    student_id: str
    status: int

#打刻
class PunchResponse(BaseModel):
    studentName: str
    status: int

#学生情報修正用
class StudentUpdate(BaseModel):
    name:str | None = None
    grade:str | None = None

#打刻
class Punch(BaseModel):
    card_id: str