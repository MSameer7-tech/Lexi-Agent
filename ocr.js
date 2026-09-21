import { createWorker } from 'tesseract.js';
import fs from 'fs';

(async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize('/Users/sameer/.gemini/antigravity/brain/95a06a5c-a54f-4a9d-8fb7-8cc94eb44fca/.user_uploaded/media_1790009371550.png');
  console.log(ret.data.text);
  await worker.terminate();
})();
