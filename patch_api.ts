import * as fs from 'fs';

let content = fs.readFileSync('src/services/lexiAgentApi.ts', 'utf8');

// Add import
if (!content.includes("import { supabase }")) {
  content = `import { supabase } from '../lib/supabase';\n` + content;
}

// Update fetch options
const oldHeaders = `      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },`;

const newHeaders = `      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
      },`;

const funcStart = `export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  try {`;

const newFuncStart = `export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;`;

content = content.replace(funcStart, newFuncStart);
content = content.replace(oldHeaders, newHeaders);

fs.writeFileSync('src/services/lexiAgentApi.ts', content);
