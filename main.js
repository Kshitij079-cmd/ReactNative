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
    const sessionId = 'session-1';
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
