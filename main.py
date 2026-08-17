from fastapi import FastAPI
app = FastAPI(title="Task API")

@app.get("/")
def root():
    return {"message": "Hello,FastAPI!"}