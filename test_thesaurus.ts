const apiKey = Deno.env.get('MW_THESAURUS_API_KEY');
if (!apiKey) {
  console.log("No API key");
  Deno.exit(1);
}
const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/pragmatic?key=${apiKey}`;
const res = await fetch(url);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
