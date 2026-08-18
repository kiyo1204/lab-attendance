from fastapi import FastAPI,HTTPException

app = FastAPI()

@app.get("/tasks/{task_id}")
def get_task(task_id:int):
    if task_id <= 0:
        raise HTTPException(status_code=404,detail="Task not found")
    return {"id":task_id,"title":"Study FastAPI"}

@app.get("/tasks")
def list_tasks(done:bool | None = None,limit:int = 20):
    return{"done":done,"limit":limit}