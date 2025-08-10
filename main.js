/* eslint-disable no-unused-vars */
import { useState } from "react";
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

let ws = null;
let currentMessageId = null;
let is_audio = false; // Default to text messages
 // Use 'ws' for Node.js environment, or a compatible library for React Native
// Placeholder for WebSocket connection
export const connectWebSocket = (onMessage, onClose, onError) => {

  // In a real React Native app, you'd use a WebSocket library here.
  // For example, 'react-native-webrtc' or a custom native module.
  console.log('Connecting WebSocket...');

  try {

    // Replace with your actual WebSocket server URL
    const wsUrl = `ws://10.0.2.2:8000/ws/${sessionId}?is_audio=false`;
    ws = new WebSocket(wsUrl);

    ws.onopen = (event) => {
      console.log('WebSocket connection opened.');

    };

    ws.onmessage = (event) => {
      try {
        const message_from_server = JSON.parse(event.data);
        console.log('[AGENT TO CLIENT] ', message_from_server);
        onMessage(message_from_server);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
      onClose();
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      onError(e);
    };
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    
  }
  return ws;
};

export const sendMessage = ( message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
      console.log('[CLIENT TO AGENT] ', message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  } else {
    console.warn('WebSocket not open. Message not sent:', message);
  }
};



// Placeholder for audio playback
const startAudioPlayback = async (pcmData) => {
  console.log('Playing audio...');
  // In React Native, you'd use a library like 'expo-av' or a custom native module
  // to play PCM audio data.
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Audio playback finished (simulated).');
      resolve();
    }, 300);
  });
};

const base64ToArray=(base64)=> {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

