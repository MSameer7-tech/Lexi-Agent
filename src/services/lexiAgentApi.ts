export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
}

const WEBHOOK_URL = 'https://sameer11123.app.n8n.cloud/webhook/lexiagent';

export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Network response was not ok. Status: ${res.status}`);
    }

    const data = await res.json();
    
    // Ensure we have a valid response string
    if (!data || typeof data.response !== 'string') {
      // In some configurations n8n returns an array or different structure.
      // Assuming it conforms to the exact specification provided by the user.
      if (Array.isArray(data) && data[0] && typeof data[0].response === 'string') {
        return {
          response: data[0].response,
          sessionId: data[0].sessionId || request.sessionId,
        };
      }
      
      throw new Error('Invalid or empty response format received from LexiAgent backend.');
    }
    
    return {
      response: data.response,
      sessionId: data.sessionId || request.sessionId,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      console.error('LexiAgent API Error:', error);
    }
    throw error;
  }
}
