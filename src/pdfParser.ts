import * as pdfjsLib from 'pdfjs-dist';
import { Production } from './types';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const parsePDFFile = async (file: File): Promise<Production[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  const blocks = fullText.split(/(?=Payroll email:)/);
  const newProds: Production[] = [];

  // Active/Wrapped
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const prevBlock = blocks[i-1];
    
    const emailMatch = block.match(/Payroll email:\s*([^\s]+)/);
    const payroll = emailMatch ? emailMatch[1] : '';

    let title = "Unknown Production";
    let company = "";
    const prevLines = prevBlock.split(/\n|  +/).map(l => l.trim()).filter(Boolean);
    const collapseIdx = prevLines.indexOf("Collapse All");
    
    if (collapseIdx !== -1 && prevLines[collapseIdx + 1]) {
      title = prevLines[collapseIdx + 1];
    } else if (prevLines.length > 0) {
      title = prevLines[prevLines.length - 1];
    }

    // If we've hit the non-union or rumoured section, stop typical block parsing
    if (block.includes('UPCOMING / RUMOURED PRODUCTIONS')) break;

    const linesAfterEmail = block.split(/\n/).map(l=>l.trim()).filter(Boolean);
    let dates = '';
    let tier = '';
    let address = '';
    let phone = '';
    let contractLink = '';
    let callSheetLink = '';

    const phoneMatch = block.match(/(\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
    if (phoneMatch) phone = phoneMatch[0];

    const urlMatches = block.match(/https?:\/\/[^\s]+/g);
    if (urlMatches) {
      urlMatches.forEach(url => {
        const lower = url.toLowerCase();
        if (lower.includes('contract')) contractLink = url;
        if (lower.includes('call') && lower.includes('sheet')) callSheetLink = url;
      });
    }

    const addrMatch = block.match(/\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Way|Drive|Dr|Lane|Ln|Court|Ct|Circle|Cir|Plaza|Plz|Square|Sq|Trail|Trl|Parkway|Pkwy|Mews|Crescent|Cres|Place|Pl|Gardens|Gdns|Row|Walk|Terrace|Ter|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Way|Wy|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk|Avenue|Ave|Boulevard|Blvd|Circle|Cir|Court|Ct|Drive|Dr|Lane|Ln|Place|Pl|Road|Rd|Square|Sq|Street|St|Terrace|Ter|Way|Wy|Crescent|Cres|Mews|Row|Walk|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk)\.?\s*,?\s*[A-Za-z\s,]+,\s*[A-Z]{2}\s+[A-Z0-9\s]+/i);
    if (addrMatch) address = addrMatch[0].trim();

    for(let j=0; j<linesAfterEmail.length; j++) {
      const line = linesAfterEmail[j];
      if(line.match(/^[A-Z][a-z]{2} \d{2} 202\d to [A-Z][a-z]{2} \d{2} 202\d/)) {
        dates = line;
        if(j >= 2 && linesAfterEmail[j-2].length > 5) company = linesAfterEmail[j-2];
      }
      if(line.includes('(Daily Seniority)') || line.includes('Supplemental TV') || line.includes('Tier')) tier = line;
    }

    const crew: Record<string, string> = {};
    const crewRegex = /"([^"]+?)\\?n?\"\s*,\s*"([^"]+?)\\?n?\"/g;
    let match;
    while ((match = crewRegex.exec(block)) !== null) {
      const role = match[1].replace(/\\n|\n|\r/g, '').trim();
      const name = match[2].replace(/\\n|\n|\r/g, '').trim();
      if (name !== 'N/A' && name !== 'Various' && name !== '') crew[role] = name;
    }
    
    newProds.push({ 
      id: crypto.randomUUID(), 
      name: title, 
      company, 
      payroll, 
      prodEmail: '',
      crew, 
      dates, 
      tier, 
      address,
      phone,
      contractLink,
      callSheetLink,
      status: title.startsWith('WRAPPED') ? 'Wrapped' : 'Active' 
    });
  }

  // Rumoured
  const rumouredSplit = fullText.split(/UPCOMING \/ RUMOURED PRODUCTIONS/i);
  if (rumouredSplit.length > 1) {
    const rLines = rumouredSplit[1].split(/\n|  +/).map(l=>l.trim()).filter(Boolean);
    for(let line of rLines) {
      if (line.includes('--- PAGE')) break; 
      if (line.match(/^[A-Za-z0-9]/) && line.includes('-')) {
        const splitIdx = line.lastIndexOf(' - ');
        const name = splitIdx > -1 ? line.substring(0, splitIdx).trim() : line;
        const dates = splitIdx > -1 ? line.substring(splitIdx + 3).trim() : 'TBA';
        newProds.push({ 
          id: crypto.randomUUID(), 
          name: name, 
          company: '', 
          payroll: '', 
          prodEmail: '',
          crew: {}, 
          dates, 
          tier: 'Rumoured', 
          status: 'Rumoured' 
        });
      }
    }
  }

  return newProds;
};
