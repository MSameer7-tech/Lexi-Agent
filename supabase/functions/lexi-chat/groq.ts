export async function callGroqChatCompletion(apiKey: string, systemPrompt: string, userMessage: string) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const payload = {
    model: "llama-3.3-70b-versatile", // Using a reliable and powerful Groq model
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
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

  return data.choices[0].message.content;
}
