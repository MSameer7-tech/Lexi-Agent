export const dictionaryToolDef = {
  type: "function",
  function: {
    name: "dictionary_lookup",
    description: "Look up an English word in the Free Dictionary API and return factual dictionary information including definitions, part of speech, pronunciation, examples, synonyms, and antonyms when available.",
    parameters: {
      type: "object",
      properties: {
        word: {
          type: "string",
          description: "The English word to look up."
        }
      },
      required: ["word"]
    }
  }
};

export async function callGroqChatCompletion(apiKey: string, messages: any[]) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const payload = {
    model: "openai/gpt-oss-20b",
    messages: messages,
    tools: [dictionaryToolDef],
    tool_choice: "auto",
    temperature: 0.2,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API Error: ${response.status} - ${errorText}`);
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response structure from Groq");
  }

  return data.choices[0].message;
}
