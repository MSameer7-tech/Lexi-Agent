const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/pragmatic?key=741a9b07-3594-4e6e-b879-3d37e048c252`;
const res = await fetch(url);
console.log("Status:", res.status);
const text = await res.text();
console.log("Text:", text);
