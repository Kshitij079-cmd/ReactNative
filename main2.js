import {EventSource} from 'eventsource'


let currentMessageId = null;

// If running in Node.js, use the 'eventsource' package
// if (typeof EventSource === "undefined") {
//   global.EventSource = require('eventsource');
// }

export const sessionId = Math.random().toString().substring(10);
export const sse_url = "http://" + "10.0.2.2:8000" + "/events/" + sessionId;
export const send_url = "http://" + "10.0.2.2:8000" + "/send/" + sessionId;

export const  connectSSE=({ onTextMessage, onAudioMessage, onStatusChange }) =>{
  let eventSource = new EventSource(`${sse_url}?is_audio=false`);
  if (eventSource) {
    eventSource.close();
  }


  eventSource.addEventListener("open", (event) => {
    console.log("SSE connection opened.");
    onStatusChange("open");
  })

  eventSource.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    console.log("[AGENT TO CLIENT]", message);

    if (message.turn_complete) {
      currentMessageId = null;
      return;
    }

    if (message.interrupted) {
      onStatusChange("interrupted");
      return;
    }

    if (message.mime_type === "audio/pcm") {
      onAudioMessage && onAudioMessage(message.data);
    }

    if (message.mime_type === "text/plain") {
      onTextMessage(message.data);
    }
  })

  eventSource.addEventListener("error", (event) => {
    console.log("SSE connection closed. Reconnecting...");
    onStatusChange("closed");
    setTimeout(() => connectSSE({ onTextMessage, onAudioMessage, onStatusChange }), 5000);
  })
}

export async function sendMessage(data) {
  try {
    const response = await fetch(send_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Failed to send message:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export const base64ToArray=(base64) =>{
  const binary = Blob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
