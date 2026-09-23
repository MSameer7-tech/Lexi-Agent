import * as fs from 'fs';
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

content = content.replace(
  'return new Response(JSON.stringify({ success: false, error: "Application error" }), { status: 500, headers: { ...corsHeaders, \'Content-Type\': \'application/json\' } });',
  'return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), { status: 500, headers: { ...corsHeaders, \'Content-Type\': \'application/json\' } });'
);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
