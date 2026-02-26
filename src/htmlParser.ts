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
    
    const tableTop = item.querySelector('.table-headertop-content');
    if (tableTop) {
      const tds = tableTop.querySelectorAll('td');
      if (tds[0]) company = tds[0].innerText.trim();
      
      const mailto = tableTop.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
      if (mailto && !mailto.innerText.toLowerCase().includes('payroll')) {
        prodEmail = mailto.innerText.trim();
      }
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
