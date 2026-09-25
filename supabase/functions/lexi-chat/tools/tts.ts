import { createClient } from "npm:@supabase/supabase-js@2";

export async function getTtsAudio(word: string, fallbackUrl: string | null): Promise<string | null> {
  try {
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanWord) return fallbackUrl;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');

    console.log("TTS ENV CHECK:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasEleven: !!elevenLabsKey
    });

    if (!supabaseUrl || !supabaseServiceKey || !elevenLabsKey) {
      return `MISSING_ENV: url=${!!supabaseUrl} key=${!!supabaseServiceKey} 11labs=${!!elevenLabsKey}`;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const fileName = `en/${cleanWord}.mp3`;
    const bucket = supabase.storage.from('pronunciations');

    // Check cache
    const { data: fileExists } = await bucket.list('en', { search: `${cleanWord}.mp3` });
    if (fileExists && fileExists.some((f: any) => f.name === `${cleanWord}.mp3`)) {
      return bucket.getPublicUrl(fileName).data.publicUrl;
    }

    // Call ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: word,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      console.error("ElevenLabs API failed:", await response.text());
      return fallbackUrl;
    }

    const arrayBuffer = await response.arrayBuffer();

    // Upload to Supabase
    const { error: uploadError } = await bucket.upload(fileName, arrayBuffer, {
      contentType: 'audio/mpeg',
      upsert: false
    });

    if (uploadError && uploadError.message !== 'The resource already exists') {
      console.error("Failed to upload TTS audio:", uploadError);
      return fallbackUrl;
    }

    return bucket.getPublicUrl(fileName).data.publicUrl;

  } catch (err: any) {
    console.error("TTS exception:", err);
    return fallbackUrl;
  }
}
