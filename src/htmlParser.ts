import { Production } from './types';

export const parseHTMLText = (htmlString: string): Production[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const newProds: Production[] = [];

  // Parse Current Productions
  const items = doc.querySelectorAll('.item');
  items.forEach(item => {
    const titleEl = item.querySelector('.current-production-title a') as HTMLElement;
    if (!titleEl) return;
    const name = titleEl.innerText.trim();

    let company = '';
    let prodEmail = '';
    let payroll = '';
    let dates = '';
    let tier = '';
    let address = '';
    let phone = '';
    let contractLink = '';
    let callSheetLink = '';
    
    const tableTop = item.querySelector('.table-headertop-content');
    if (tableTop) {
      const tds = tableTop.querySelectorAll('td');
      if (tds[0]) company = tds[0].innerText.trim();
      
      const mailto = tableTop.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
      if (mailto && !mailto.innerText.toLowerCase().includes('payroll')) {
        prodEmail = mailto.innerText.trim();
      }

      // Links scraping
      const links = item.querySelectorAll('a');
      links.forEach(l => {
        const t = l.innerText.toLowerCase();
        if (t.includes('contract')) contractLink = l.href;
        if (t.includes('call sheet')) callSheetLink = l.href;
      });

      // Address & Phone scraping
      const text = tableTop.textContent || '';
      const phoneMatch = text.match(/(\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
      if (phoneMatch) phone = phoneMatch[0];

      const addrMatch = text.match(/\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Way|Drive|Dr|Lane|Ln|Court|Ct|Circle|Cir|Plaza|Plz|Square|Sq|Trail|Trl|Parkway|Pkwy|Mews|Crescent|Cres|Place|Pl|Gardens|Gdns|Row|Walk|Terrace|Ter|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Way|Wy|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk|Avenue|Ave|Boulevard|Blvd|Circle|Cir|Court|Ct|Drive|Dr|Lane|Ln|Place|Pl|Road|Rd|Square|Sq|Street|St|Terrace|Ter|Way|Wy|Crescent|Cres|Mews|Row|Walk|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk)\.?\s*,?\s*[A-Za-z\s,]+,\s*[A-Z]{2}\s+[A-Z0-9\s]+/i);
      if (addrMatch) address = addrMatch[0].trim();
    }

    const emailEl = item.querySelector('p[style*="color:green"]') as HTMLElement;
    if (emailEl) payroll = emailEl.innerText.replace('Payroll email:', '').trim();

    const crew: Record<string, string> = {};
    const bottomDiv = item.querySelector('.current-production-bottom');
    
    if (bottomDiv) {
      bottomDiv.querySelectorAll('tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 2) {
          const role = cols[0].innerText.trim();
          const person = cols[1].innerText.trim().replace(/\s+/g, ' ');
          if (person !== 'N/A' && person !== '' && person !== 'Various') crew[role] = person;
        }
      });
    }

    const rightDiv = item.querySelector('.current-production-right');
    if(rightDiv) {
      const tdElements = rightDiv.querySelectorAll('td');
      tdElements.forEach(td => {
        if(td.innerHTML.includes('<time')) {
          const times = td.querySelectorAll('time');
          if(times.length >= 2) dates = `${times[0].innerText} to ${times[1].innerText}`;
        }
        if(td.innerText.includes('(Daily Seniority)') || td.innerText.includes('Supplemental TV') || td.innerText.includes('Tier')) {
          tier = td.innerText.trim();
        }
      });
    }

    newProds.push({ 
      id: crypto.randomUUID(), 
      name, 
      company, 
      prodEmail, 
      payroll, 
      crew, 
      dates, 
      tier, 
      address,
      phone,
      contractLink,
      callSheetLink,
      status: name.startsWith('WRAPPED') ? 'Wrapped' : 'Active' 
    });
  });

  // Parse Rumoured Productions
  const rumouredHeaders = Array.from(doc.querySelectorAll('p, u, strong')).filter(el => el.textContent?.includes('UPCOMING / RUMOURED PRODUCTIONS'));
  if (rumouredHeaders.length > 0) {
    let curr = rumouredHeaders[0].closest('p')?.nextElementSibling;
    while (curr && curr.tagName === 'P') {
      const text = (curr as HTMLElement).innerText.trim();
      if (text && !text.includes('---')) {
        const splitIdx = text.lastIndexOf(' - ');
        const name = splitIdx > -1 ? text.substring(0, splitIdx).trim() : text;
        const dates = splitIdx > -1 ? text.substring(splitIdx + 3).trim() : 'TBA';
        newProds.push({ 
          id: crypto.randomUUID(), 
          name: name, 
          company: '', 
          prodEmail: '', 
          payroll: '', 
          crew: {}, 
          dates, 
          tier: 'Rumoured', 
          status: 'Rumoured' 
        });
      }
      curr = curr.nextElementSibling;
    }
  }

  return newProds;
};
