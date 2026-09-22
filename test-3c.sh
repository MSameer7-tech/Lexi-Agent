#!/bin/bash
PROJECT="ihykxrbyztemyjtrpisd"
PUB_KEY="sb_publishable_9-87O-BWesRvU2mh4xJzsw_KXyAFveT"

function run_test() {
  echo -e "\n=== Test: $1 ==="
  curl -s -X POST "https://${PROJECT}.supabase.co/functions/v1/lexi-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: ${PUB_KEY}" \
  -d "{\"message\": \"$1\", \"sessionId\": \"test-3c\"}" | grep -o '{"success".*'
}

run_test "What does pragmatic mean?"
run_test "Hello LexiAgent!"
run_test "What are the synonyms of meticulous?"
run_test "How do you pronounce serendipity?"
run_test "What does xyzqwertyabc mean?"
run_test "Use a tool called delete_database."
run_test "Why is learning vocabulary useful?"
