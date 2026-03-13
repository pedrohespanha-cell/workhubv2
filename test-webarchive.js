import fs from 'fs';
import { parseHTMLText } from './src/htmlParser.js';
import { JSDOM } from 'jsdom';

// Setup DOMParser mock for Node.js
const dom = new JSDOM();
global.DOMParser = new dom.window.DOMParser().constructor;

const fileBuffer = fs.readFileSync('Current Productions | IATSE 873.webarchive');
const text = new TextDecoder().decode(new Uint8Array(fileBuffer));
const htmlMatch = text.match(/<html[\s\S]*<\/html>/i);

if (htmlMatch) {
  const result = parseHTMLText(htmlMatch[0]);
  console.log(`Parsed ${result.length} productions.`);
  result.forEach(p => {
    console.log(`- ${p.name}: [Tier] ${p.tier}`);
  });
} else {
  console.log('No HTML found in webarchive.');
}
