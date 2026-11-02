import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv("../.devcontainer/")

# ベースクラス
class Base(DeclarativeBase):
    pass

# 接続先URL
url = URL.create(
    drivername="mysql+pymysql",
    username=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    host="localhost",
    port=3306,
    database=os.environ["MYSQL_DATABASE"],
    query={"charset": "utf8mb4"},
)

# エンジンの作成
engine = create_engine(
    url,
    pool_pre_ping=True,
    echo=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session