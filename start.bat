@echo off
cd /d "%~dp0"

:: FastAPIの起動
if not exist ".\backend\venv" (
	wt -d ".\backend" cmd /k "python -m venv venv && call .\venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"
) else (
	wt -d ".\backend" cmd /k "call .\venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"
)

:: Viteの起動
if not exist ".\frontend\node_modules" (
	wt -d ".\frontend" cmd /k "npm i && npm run dev"
) else (
	wt -d ".\frontend" cmd /k "npm run dev"
)