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
    const name = titleEl.textContent?.trim() || '';

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
      if (tds[0]) company = tds[0].textContent?.trim() || '';

      const mailto = tableTop.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
      if (mailto && !mailto.textContent?.toLowerCase().includes('payroll')) {
        prodEmail = mailto.textContent?.trim() || '';
      }

      // Links scraping
      const links = item.querySelectorAll('a');
      links.forEach(l => {
        const t = l.textContent?.toLowerCase() || '';
        const rawHref = l.getAttribute('href') || l.href;

        // Ensure relative URLs point to IATSE domain
        let finalHref = rawHref;
        if (finalHref && !finalHref.startsWith('http') && !finalHref.startsWith('mailto')) {
          finalHref = finalHref.replace(/^(\.\.\/)+/, '/'); // Clean up webarchive deep traversals
          finalHref = finalHref.startsWith('/') ? `https://www.iatse873.com${finalHref}` : `https://www.iatse873.com/${finalHref}`;
        }

        if (t.includes('contract')) contractLink = finalHref;
        if (t.includes('call sheet')) callSheetLink = finalHref;
      });

      // Address & Phone scraping
      const text = Array.from(tableTop.querySelectorAll('td')).map(td => td.textContent?.trim()).join(' ');
      const phoneMatch = text.match(/(\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
      if (phoneMatch) phone = phoneMatch[0];

      // Robust Address Matcher: Look for <div class="col-md-6"> then table-headertop-content to grab 2nd/3rd td rows
      const allRows = Array.from(tableTop.querySelectorAll('tr')).map(tr => tr.textContent?.trim() || '');
      // The convention is Row 0: Company, Row 1: Street, Row 2: City/Canada string
      if (allRows.length >= 3) {
        let street = allRows[1];
        let cityZip = allRows[2].replace(/\n/g, ' ').replace(/\s+/g, ' ');
        if (street && street.match(/\d+/) && cityZip.includes('Canada')) { // Basic validation
          address = `${street}, ${cityZip.replace('Canada', '').trim()}, Canada`.replace(/, ,/g, ',');
        }
      }

      // Fallback regex if positional logic fails
      if (!address) {
        const addrMatch = text.match(/\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Way|Drive|Dr|Lane|Ln|Court|Ct|Circle|Cir|Plaza|Plz|Square|Sq|Trail|Trl|Parkway|Pkwy|Mews|Crescent|Cres|Place|Pl|Gardens|Gdns|Row|Walk|Terrace|Ter|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Way|Wy|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk|Avenue|Ave|Boulevard|Blvd|Circle|Cir|Court|Ct|Drive|Dr|Lane|Ln|Place|Pl|Road|Rd|Square|Sq|Street|St|Terrace|Ter|Way|Wy|Crescent|Cres|Mews|Row|Walk|Close|Cl|Grove|Grv|View|Vw|Rise|Rse|Common|Cmn|Gate|Gt|Link|Lnk|Loop|Lp|Path|Pth|Track|Trk|Trail|Trl|Highway|Hwy|Expressway|Expy|Freeway|Fwy|Turnpike|Tpk|Tollway|Tly|Bypass|Byp|Park|Pk)\.?\s*,?\s*[A-Za-z\s,]+,\s*[A-Z]{2}\s+[A-Z0-9\s]+/i);
        if (addrMatch) address = addrMatch[0].trim();
      }
    }

    const emailEl = item.querySelector('p[style*="color:green"]') as HTMLElement;
    if (emailEl) payroll = emailEl.textContent?.replace('Payroll email:', '').trim() || '';

    const crew: Record<string, string> = {};
    const bottomDiv = item.querySelector('.current-production-bottom');

    if (bottomDiv) {
      bottomDiv.querySelectorAll('tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 2) {
          const role = cols[0].textContent?.trim() || '';
          const person = cols[1].textContent?.trim().replace(/\s+/g, ' ') || '';
          if (person !== 'N/A' && person !== '' && person !== 'Various') crew[role] = person;
        }
      });
    }

    const rightDiv = item.querySelector('.current-production-right');
    if (rightDiv) {
      const tdElements = rightDiv.querySelectorAll('td');
      tdElements.forEach(td => {
        if (td.innerHTML.includes('<time')) {
          const times = td.querySelectorAll('time');
          if (times.length >= 2) dates = `${times[0].textContent} to ${times[1].textContent}`;
        }
        const text = td.textContent || '';
        if (
          text.includes('(Daily Seniority)') ||
          text.includes('Supplemental TV') ||
          text.includes('Tier') ||
          text.includes('Network') ||
          text.includes('SVOD') ||
          text.includes('Feature') ||
          text.includes('Budget')
        ) {
          tier = text.trim().replace(/\s+/g, ' ');
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
      const text = (curr as HTMLElement).textContent?.trim() || '';
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
