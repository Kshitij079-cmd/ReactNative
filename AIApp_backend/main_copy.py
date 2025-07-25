from agent import root_agent
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class userData(BaseModel):
    message: str
app = FastAPI()


@app.post("/ask-your-agent")
async def ask_agent(data: userData):
    """Endpoint to chat with the agent."""
    user_message = data.message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        reply = await root_agent(user_message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))