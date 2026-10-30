from typing import List
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Boolean, func, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from database import Base

class User(Base):
    __tablename__ = "usertable"

    # ユーザーID
    user_id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        autoincrement=True
    )

    # 学生番号
    student_id: Mapped[str] = mapped_column(
        String(100), 
        nullable=False, 
        unique=True
    )

    # 名前
    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )

    # カード番号
    card_id: Mapped[str] = mapped_column(
        String(100), 
        nullable=False,
        unique=True
    )

    # 学年
    grade: Mapped[str] = mapped_column(String(30))
    
    # 現在の状況
    current_status_type_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("status_types.status_type_id"),
        nullable=False
    )

    # 作成日
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(), # SQLの関数
    )

    # 更新日
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        onupdate=func.now(),
        server_default=func.now()
    )

    # 現在利用中のアカウントか 
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

class Status(Base):
    __tablename__ = "status_types"

    # 状況識別番号
    status_type_id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        autoincrement=True
    )

    # 状態コード
    status_code: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        unique=True
    )

    # ユーザーに見せる状態名
    status_name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )

    # 滞在時間に加算するかどうか
    counts_as_present: Mapped[bool] = mapped_column(
        Boolean, 
        default=False
    )

    # 一覧表示順
    sort_order: Mapped[int] = mapped_column(Integer)
    
    # 新しい操作で選べる状態か
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True
    )

    # 状態定義時の日時
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now()
    )


class ScanLogs(Base):
    __tablename__ = "scan_logs"

    # スキャン記録の識別番号
    scan_log_id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        autoincrement=True
    )

    # ユーザー名
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("usertable.user_id"), 
        nullable=False
    )

    # スキャンした日時
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now()
    )

    # カードから読み取った値
    scan_value: Mapped[str | None] = mapped_column(
        String(255), 
        nullable=True
    )

    # 読み取り端末の識別番号
    device_id: Mapped[str | None] = mapped_column(
        String(100), 
        nullable=True
    )

    # スキャン処理の結果
    result_code: Mapped[str] = mapped_column(
        String(30), 
        nullable=False
    )

    # 同じ要求の再送を見分けるキー
    request_key: Mapped[str | None] = mapped_column(
        String(100), 
        nullable=True, 
        unique=True
    )


class StatusLogs(Base):
    __tablename__ = "statuslogs"

    # 状態履歴を識別する番号
    status_log_id: Mapped[int] = mapped_column(
        Integer, 
        primary_key=True, 
        autoincrement=True
    )

    # ユーザー名
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("usertable.user_id"),
        nullable=False
    )

    # 変更後の状態
    status_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("status_types.status_type_id"),
        nullable=False
    )

    # 新しい状態になった日時
    changed_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    # きっかけとなったスキャン記録
    scan_log_id: Mapped[int | None] = mapped_column(
        ForeignKey("scan_logs.scan_log_id"),
        nullable=True
    )

    # 変更を行った管理者
    changed_by_user_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    # 手動変更・訂正をした理由
    change_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    
