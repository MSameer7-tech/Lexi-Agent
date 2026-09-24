import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Replace the stats array
const oldStats = `                {[
                  ['2.4k', 'words found'],
                  ['418', 'saved notes'],
                  ['Fresh', 'daily recall'],
                ]`;
                
const newStats = `                {[
                  ['A—Z', 'definitions'],
                  ['Audio', 'pronunciations'],
                  ['Synced', 'vocabulary'],
                ]`;

content = content.replace(oldStats, newStats);

fs.writeFileSync('src/pages/Auth.tsx', content);
