/* eslint-disable no-unused-vars */
const BASE_URL = 'http://10.0.2.2:8000'; 
// const BASE_URL = 'http://localhost:8000'; // ADK server base URL

const __header = {
    cache: 'no-cache',
    'Content-Type': 'application/json',
};

const send = async (url, data, header = __header) => {
    let head = { ...header }; // Avoid mutating original header
    try {
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: head,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Network or API error:", error);
        throw error;
    }
};
       const agentName = 'weather_and_time_agent'; // from class WeatherTimeAgent
    const userId = 'test_user';
    const sessionId = Math.random().toString().substring(10)
export const activateSession = async () => {//this wiil activate the session

    return await send(
        `/apps/${agentName}/users/${userId}/sessions/${sessionId}`,
        {
            state: {
                key1: "value1",
                key2: 42
            }
        }
    );
};

export const askAgent = async (message) => {
    const sendingMessageTOAgent = await send(
        `/run`,
        {
            appName: agentName,
            userId,
            sessionId,
            newMessage: {
                role: 'user',
                parts: [
                    {
                        text: message
                    }
                ]
            }
        }
    );
    console.log("sendingMessageTOAgent:", sendingMessageTOAgent);
    return sendingMessageTOAgent
};

let websocket = null;
let currentMessageId = null;
let is_audio = false; // Default to text messages

export const connectWebsocket = ({
  onOpen,
  onMessage,
  onClose,
  audioPlayerNode = null,
}) => {
  const wsURL = `ws://10.0.2.2:8000/ws/${sessionId}?is_audio=false`;
  websocket = new WebSocket(wsURL);
 websocket.onopen = () => {
    console.log('✅ WebSocket connection opened');
    onOpen?.();
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('[📨 AGENT → CLIENT]', data);

    if (data.turn_complete) {
      currentMessageId = null;
      return;
    }

    if (data.mime_type === 'text/plain') {
      onMessage?.(data.data); // Pass text to UI
    }

    if (data.mime_type === 'audio/pcm' && audioPlayerNode) {
      const arrayBuffer = base64ToArray(data.data);
      audioPlayerNode.port.postMessage(arrayBuffer);
    }
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onclose = (event) => {
    console.log('❌ WebSocket closed', event.code, "Reason:", event.reason);
    onClose?.();
  };
};

export const sendMessage = (messageObj) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(messageObj));
  } else {
    console.warn('WebSocket not ready. Message not sent.');
  }
  return websocket;
};

function base64ToArray(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
