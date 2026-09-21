import type { ApiRequest, ApiResponse } from '../types';

// Mock responses to simulate the AI agent
const MOCK_RESPONSES: Record<string, string> = {
  'serendipity': '**serendipity** \\n\\n*noun* \\n\\nThe occurrence and development of events by chance in a happy or beneficial way.\\n\\n**Synonyms:** chance, happy coincidence, fluke\\n\\n**Example:** "a fortunate stroke of serendipity"',
  'ephemeral': '**ephemeral** \\n\\n*adjective* \\n\\nLasting for a very short time.\\n\\n**Synonyms:** fleeting, passing, short-lived\\n\\n**Example:** "fashions are ephemeral"',
  'pragmatic': '**pragmatic** \\n\\n*adjective* \\n\\nDealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.\\n\\n**Synonyms:** practical, sensible, down-to-earth',
  'default': 'I found some interesting information about that. Could you clarify what specific aspect you would like to know? (This is a mock response, as the API is not yet connected).'
};

export async function sendMessage(request: ApiRequest): Promise<ApiResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const lowerMessage = request.message.toLowerCase();
  
  let responseText = MOCK_RESPONSES['default'];
  
  if (lowerMessage.includes('serendipity')) {
    responseText = MOCK_RESPONSES['serendipity'];
  } else if (lowerMessage.includes('ephemeral')) {
    responseText = MOCK_RESPONSES['ephemeral'];
  } else if (lowerMessage.includes('pragmatic')) {
    responseText = MOCK_RESPONSES['pragmatic'];
  }

  return {
    response: responseText,
    sessionId: request.sessionId
  };
}
