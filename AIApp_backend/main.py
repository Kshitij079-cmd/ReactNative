from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# from agent import WeatherTimeAgent
from agent import root_agent as WeatherTimeAgent

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS: allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ADK agent instance
agent = WeatherTimeAgent()

# Data model for request
class UserQuery(BaseModel):
    text: str
    session_id: str | None = None  # Optional session ID

@app.get("/")
async def health_check():
    return {"message": "Backend is running and ready to chat with AI agent."}

@app.post("/ask-agent")
async def ask_agent(data: UserQuery):
    user_input = data.text.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Input cannot be empty.")

    try:
        response = await agent.run(user_input, session_id=data.session_id)
        return {"reply": response}
    except Exception as e:
        print(f"[ERROR] Agent failed: {e}")
        raise HTTPException(status_code=500, detail="Agent failed to respond.")

# Optional: run this if you want to start ADK server too
# if __name__ == "__main__":
#     from google.adk.cli.api_server import start_agent_server
#     start_agent_server(WeatherTimeAgent)
