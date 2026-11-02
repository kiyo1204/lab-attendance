from typing import Annotated
from fastapi import FastAPI,HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from database import Base, engine, get_db
from models import User, Status, ScanLogs, StatusLogs
from schemas import PostStudents, StudentStatusResponse, AttendanceResponse, PunchResponse, StudentResponse, Punch, StudentUpdate

# Statusテーブルの初期データ
def init_statuses():
    statuses = [
        ("OUT", "退室", False, 0),
        ("IN", "入室", True, 1),
        ("AWAY", "一時退室", False, 2)
    ]

    with Session(engine) as db:
        # 既に登録されているstatus_code
        existing = set(
            db.scalars(select(Status.status_code)).all()
        )

        for code, name, present, order in statuses:
            if code not in existing:
                db.add(
                    Status(
                        status_code=code,
                        status_name=name,
                        counts_as_present=present,
                        sort_order=order,
                        is_active=True,
                        created_at=func.now()
                    )
                )
        db.commit()

# FastAPI起動時に実行
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 全テーブルを作成
    Base.metadata.create_all(bind=engine)
    init_statuses()
    yield

app = FastAPI(lifespan=lifespan)

SessionDep = Annotated[Session, Depends(get_db)]

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


#学生登録
@app.post("/students", response_model=StudentResponse, status_code=201)
def post_students(data:PostStudents, db: SessionDep):
    initial_status = db.scalar(
        select(Status).where(
            Status.status_code == "OUT"
        )
    )

    if initial_status is None:
        raise HTTPException(
            status_code=500,
            detail="初期状態が設定されていません"
        )

    student = User(
        student_id=data.student_id,
        name=data.name,
        card_id=data.card_id,
        grade=data.grade,
        current_status_type_id=initial_status.status_type_id,
    )

    db.add(student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="ユーザーを登録できませんでした"
        )

    db.refresh(student)
    return student

#学生一覧
@app.get("/students", response_model=list[StudentResponse])
def get_students(db: SessionDep):
    return db.scalars(select(User)).all()

#カードから学生情報取得
def find_student_by_card(card_id:str, db:Session):
    student = db.scalar(
        select(User).where(User.card_id == card_id)
    )

    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    return student

#カードIDで打刻
@app.post("/punch", response_model=PunchResponse, status_code=201)
def punch(data: Punch, db: SessionDep):
    with db.begin():
        # カードIDから学生を検索してロック
        student = db.scalar(
            select(User).where(User.card_id == data.card_id).with_for_update()
        )

        if student is None:
            raise HTTPException(status_code=404,detail="Card not found")

        # 現在の状態を取得
        current_status = db.get(
            Status,
            student.current_status_type_id
        )

        if current_status is None:
            raise HTTPException(
                status_code=500,
                detail="現在の状態が不正です"
            )

        if current_status.status_code not in {"IN", "OUT"}:
            raise HTTPException(
                status_code=409,
                detail="この状態からは打刻できません"
            )

        # 入退室切り替え
        new_code = (
            "OUT"
            if current_status.status_code == "IN"
            else "IN"
        )

        new_status = db.scalar(
            select(Status).where(
                Status.status_code == new_code, 
                Status.is_active.is_(True)
            )
        )

        if new_status is None:
            raise HTTPException(
                status_code=500,
                detail="切り替え先の状態がありません"
            )

        # カード読み取り履歴
        scan_log = ScanLogs(
            user_id=student.user_id,
            scanned_at=func.now(),
            scan_value=data.card_id,
            result_code="SUCCESS"
        )

        db.add(scan_log)
        db.flush()

        # 状態変更履歴
        status_log = StatusLogs(
            user_id=student.user_id,
            status_type_id=new_status.status_type_id,
            changed_at=func.now(),
            scan_log_id=scan_log.scan_log_id,
            change_reason="CARD_SCAN"
        )

        db.add(status_log)

        # 学生の現在状況も更新
        student.current_status_type_id = (new_status.status_type_id)

        result = {
            "studentName": student.name,
            "status": int(new_status.counts_as_present)
        }

    return result

#reactに返す用
@app.get("/students/status", response_model=list[StudentStatusResponse])
def get_member_status(db: SessionDep):
    stmt = (
        select(User, Status).join(
            Status,
            User.current_status_type_id == Status.status_type_id
        ).order_by(User.student_id)
    )

    result = []

    for student, status in db.execute(stmt):
        result.append({
            "student_id": student.student_id,
            "name": student.name,
            "status": int(status.counts_as_present),
            "grade": student.grade,
        })

    return result

@app.get("/attendances",response_model=list[AttendanceResponse])
def get_attendances(db: SessionDep):
    stmt = (
        select(StatusLogs, User, Status).join(User, StatusLogs.user_id == User.user_id).join(
            Status,
            StatusLogs.status_type_id == Status.status_type_id
        ).order_by(
            StatusLogs.changed_at.desc(),
            StatusLogs.status_log_id.desc()
        )
    )

    return [
        {
            "id": log.status_log_id,
            "student_id": student.student_id,
            "status": int(status.counts_as_present),
        }
    for log, student, status in db.execute(stmt)
    ]


@app.get("/students/card/{card_id}", response_model=StudentResponse)
def get_student_by_card(card_id:str, db: SessionDep):
    return find_student_by_card(card_id, db)

#学生修正
@app.patch("/students/card/{card_id}", response_model=StudentResponse)
def update_student(card_id:str, data:StudentUpdate, db: SessionDep):
    student = find_student_by_card(card_id, db)

    changes = data.model_dump(exclude_unset=True)

    for key, value in changes.items():
        setattr(student, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="学生情報を更新できませんでした"
        )

    db.refresh(student)
    return student
    
#打刻修正
"""def find_punch(id:int):
    for i in attendances:
        if i["id"] == id:
            return i
    raise HTTPException(status_code=404,detail="ID not found")"""

"""@app.patch("/attendances/{id}")
def update_attendance(id:int,data:AttendanceUpdate):
    current = find_punch(id)
    changes = data.model_dump(exclude_unset=True)
    current.update(changes)
    return current"""


#学生削除
def find_student(student_id:str):
    for i in students:
        if i["student_id"] == student_id:
            return i
    raise HTTPException(status_code=404,detail="Student not found")

@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id:str, db: SessionDep):
    student = db.scalar(
        select(User).where(
            User.student_id == student_id
        )
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    db.delete(student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="関連データがあるため削除できません"
        )

#打刻削除
"""@app.delete("/attendances/{id}")
def delete_punch(id: int):
    current = find_punch(id)
    attendances.remove(current)"""