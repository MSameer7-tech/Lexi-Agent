const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihykxrbyztemyjtrpisd.supabase.co';
const anonKey = 'sb_publishable_9-87O-BWesRvU2mh4xJzsw_KXyAFveT';

async function test(word: string) {
  const res = await fetch(`${supabaseUrl}/functions/v1/lexi-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      message: `What does ${word} mean?`,
      sessionId: `test-${Date.now()}`
    })
  });
  const data = await res.json();
  console.log(`--- Result for ${word} ---`);
  console.log("Dictionary pronunciations:", JSON.stringify(data.dictionary?.pronunciations, null, 2));
}

await test("pragmatic");
await test("ephemeral");
