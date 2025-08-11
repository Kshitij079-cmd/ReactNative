import os
import json
import asyncio
import base64
import warnings

from pathlib import Path
from dotenv import load_dotenv

from google.genai.types import (
    Part,
    Content,
    Blob,
)

from google.adk.runners import InMemoryRunner
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.genai import types
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from weather_and_time_agent.agent import root_agent  # Import the agent
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")
load_dotenv()

APP_NAME = "weather_and_time_agent"
session_service = InMemorySessionService()


async def start_agent_session(session_id, is_audio=False):
    """Starts an agent session"""

    runner = InMemoryRunner(
        app_name=APP_NAME,
        agent=root_agent,
    )
     # Create a Session
    session = await runner.session_service.create_session(
        app_name=APP_NAME,
        user_id=session_id,  # Replace with actual user ID
    )
    print(f"session is running now{session}")
    modality = "AUDIO" if is_audio else "TEXT"
    speech_config = types.SpeechConfig(
        voice_config=types.VoiceConfig(
            # Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr
            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Puck")
        )
    )

    # Create run config with basic settings
    config = {"response_modalities": [modality], "speech_config": speech_config}

    # Add output_audio_transcription when audio is enabled to get both audio and text
    if is_audio:
        config["output_audio_transcription"] = {}


    run_config = RunConfig(response_modalities=[modality])

    # Create a LiveRequestQueue for this session
    live_request_queue = LiveRequestQueue()

    # Start agent session
    live_events = runner.run_live(
        session=session,
        live_request_queue=live_request_queue,
        run_config=run_config,
    )
    print(f"Live Events in agent session:{live_events}")

    return live_events, live_request_queue

async def agent_to_client_messaging(websocket, live_events):
    """Agent to client communication"""
    while True:
        async for event in live_events:

            # If the turn complete or interrupted, send it
            if event.turn_complete or event.interrupted:
                message = {
                    "turn_complete": event.turn_complete,
                    "interrupted": event.interrupted,
                }
                await websocket.send_text(json.dumps(message))
                print(f"[AGENT TO CLIENT]: {message}")
                continue

            # Read the Content and its first Part
            part: Part = (
                event.content and event.content.parts and event.content.parts[0]
            )
            print(f"[AGENT TO CLIENT]: {part}")
            is_audio = part.inline_data and part.inline_data.mime_type.startswith("audio/pcm")
            if not part:
                continue
            # # If it's audio, send Base64 encoded audio data
            # if is_audio:
            #     audio_data = part.inline_data and part.inline_data.data
            #     if audio_data:
            #         message = {
            #             "mime_type": "audio/pcm",
            #             "data": base64.b64encode(audio_data).decode("ascii")
            #         }
            #         await websocket.send_text(json.dumps(message))
            #         print(f"[AGENT TO CLIENT]: audio/pcm: {len(audio_data)} bytes.")
            #         continue

            # If it's text and a parial text, send it
            if part.text and event.partial:
                message = {
                    "mime_type": "text/plain",
                    "data": part.text
                }
                await websocket.send_text(json.dumps(message))
                print(f"[AGENT TO CLIENT]: text/plain: {message}")

# async def agent_to_client_messaging(websocket, live_events):
#     try:
#         async for event in live_events:
#             part = event.content and event.content.parts and event.content.parts[0]
#             print(f"[AGENT TO CLIENT]: {part}")
#             if not part:
#                 continue

#             # Send text
#             if part.text and event.partial:
#                 message = {"mime_type": "text/plain", "data": part.text}
#                 await websocket.send_text(json.dumps(message))
#                 print(f"[AGENT TO CLIENT]: {message.data}")

#             # If turn complete
#             if event.turn_complete or event.interrupted:
#                 message = {
#                     "turn_complete": event.turn_complete,
#                     "interrupted": event.interrupted,
#                 }
#                 await websocket.send_text(json.dumps(message))
#     except WebSocketDisconnect:
#         print("[AGENT TO CLIENT] Client disconnected")

async def client_to_agent_messaging(websocket: WebSocket, live_request_queue):
    print("[CLIENT TO AGENT]: Starting client to agent messaging")
    try:
        """Client to agent communication"""
        while True:
            # Decode JSON message
            message_json = await websocket.receive_text()
            print(f"[CLIENT TO AGENT]: Received message: {message_json}")
            message = json.loads(message_json)
            mime_type = message["mime_type"]
            data = message["data"]
            print(f"Here after getting data from client{data}")
            # Send the message to the agent
            if mime_type == "text/plain":
                # Send a text message
                content = Content(role="user", parts=[Part.from_text(text=data)])
                live_request_queue.send_content(content=content)
                print(f"[CLIENT TO AGENT]: {data}")
            elif mime_type == "audio/pcm":
                # Send an audio data
                decoded_data = base64.b64decode(data)
                live_request_queue.send_realtime(Blob(data=decoded_data, mime_type=mime_type))
            else:
                raise ValueError(f"Mime type not supported: {mime_type}")
    except:
        print("[CLIENT TO AGENT]: Error in client to agent messaging")
        raise

app = FastAPI()

@app.get("/")
async def root():
    websocketStart =    """Serves starts """
    print(websocketStart)
    return websocketStart


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, is_audio: str):
    websocket_endpoint_indicator =   """Client websocket endpoint <-----"""
    print(f"websocket_endpoint_indicator, {websocket_endpoint_indicator}")
    # Wait for client connection
    await websocket.accept()
    print(f"Client #{user_id} connected, audio mode: {is_audio}")

    # Start agent session
    user_id_str = str(user_id)
    live_events, live_request_queue =  await start_agent_session(user_id_str, is_audio == "true")
    print(f"Agent session started for user #{user_id}")
    print(f"Live events: {live_events}")
    print(f"Live request queue: {live_request_queue}")

    # Start tasks
    agent_to_client_task =  asyncio.create_task(
    agent_to_client_messaging(websocket, live_events)
)
    client_to_agent_task = asyncio.create_task(
        client_to_agent_messaging(websocket, live_request_queue)
    )
    print(f"initiated client_to_agent_task")


    # Wait until the websocket is disconnected or an error occurs
    tasks = [agent_to_client_task, client_to_agent_task]
    await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)

    # Close LiveRequestQueue
    live_request_queue.close()

    # Disconnected
    print(f"Client #{user_id} disconnected")