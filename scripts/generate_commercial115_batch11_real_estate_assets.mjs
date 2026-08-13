import fs from 'node:fs';
import path from 'node:path';

const actors = [
    { slug: 'imovirtual-lisbon', title: 'Licensed Lisbon Property Export Normalizer', market: 'LISBON · PORTUGAL', accent: '#2DD4BF', accent2: '#60A5FA', glow: '#0F766E' },
    { slug: 'krisha-kz', title: 'Licensed Almaty Property Export Normalizer', market: 'ALMATY · KAZAKHSTAN', accent: '#FBBF24', accent2: '#38BDF8', glow: '#B45309' },
    { slug: 'otodom-warsaw', title: 'Licensed Warsaw Property Export Normalizer', market: 'WARSAW · POLAND', accent: '#FB7185', accent2: '#A78BFA', glow: '#BE123C' },
    { slug: 'realitica-adriatic', title: 'Licensed Adriatic Property Export Normalizer', market: 'ADRIATIC PROPERTY EXPORTS', accent: '#34D399', accent2: '#22D3EE', glow: '#047857' },
    { slug: 'ss-ge-tbilisi', title: 'Licensed Tbilisi Property Export Normalizer', market: 'TBILISI · GEORGIA', accent: '#F97316', accent2: '#FACC15', glow: '#C2410C' },
];

const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[character]));

const hero = ({ title, market, accent, accent2, glow }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#06101F"/><stop offset="1" stop-color="#101B33"/></linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${accent}"/><stop offset="1" stop-color="${accent2}"/></linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="45"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="1420" cy="90" r="250" fill="${glow}" opacity=".20" filter="url(#soft)"/>
  <circle cx="160" cy="820" r="230" fill="${accent2}" opacity=".09" filter="url(#soft)"/>
  <path d="M0 760 L160 650 L260 710 L430 565 L560 635 L720 500 L850 590 L1040 430 L1210 560 L1370 390 L1600 535 V900 H0Z" fill="#0B1730" opacity=".88"/>
  <text x="82" y="92" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="${accent}">${escapeXml(market)}</text>
  <text x="82" y="180" font-family="Inter,Arial,sans-serif" font-size="58" font-weight="760" fill="#FFFFFF">${escapeXml(title)}</text>
  <text x="84" y="236" font-family="Inter,Arial,sans-serif" font-size="29" fill="#B9CAE7">Authorized property records in. Review-ready evidence out.</text>
  <rect x="82" y="300" width="1436" height="3" fill="url(#line)"/>
  <g font-family="Inter,Arial,sans-serif">
    <rect x="82" y="355" width="410" height="300" rx="28" fill="#13213B" stroke="${accent}" stroke-width="2"/>
    <text x="118" y="415" font-size="21" font-weight="700" fill="${accent}">YOUR AUTHORIZED EXPORT</text>
    <text x="118" y="480" font-size="27" fill="#F4F8FF">Stable listing identity</text><text x="118" y="528" font-size="27" fill="#F4F8FF">Rights context</text><text x="118" y="576" font-size="27" fill="#F4F8FF">Source provenance</text>
    <rect x="595" y="355" width="410" height="300" rx="28" fill="#13213B" stroke="${accent2}" stroke-width="2"/>
    <text x="631" y="415" font-size="21" font-weight="700" fill="${accent2}">ZERO-NETWORK NORMALIZATION</text>
    <text x="631" y="480" font-size="27" fill="#F4F8FF">Validate &amp; dedupe</text><text x="631" y="528" font-size="27" fill="#F4F8FF">Bind evidence digests</text><text x="631" y="576" font-size="27" fill="#F4F8FF">Expose confidence gaps</text>
    <rect x="1108" y="355" width="410" height="300" rx="28" fill="#13213B" stroke="url(#line)" stroke-width="2"/>
    <text x="1144" y="415" font-size="21" font-weight="700" fill="${accent}">CURRENT-RUN OUTCOME</text>
    <text x="1144" y="480" font-size="27" fill="#F4F8FF">Dataset evidence row</text><text x="1144" y="528" font-size="27" fill="#F4F8FF">Exact paid-unit receipt</text><text x="1144" y="576" font-size="27" fill="#F4F8FF">Human review action</text>
  </g>
  <g font-family="Inter,Arial,sans-serif" font-size="19" font-weight="700"><rect x="84" y="718" width="270" height="48" rx="24" fill="${accent}" opacity=".15"/><text x="111" y="749" fill="${accent}">ZERO SOURCE REQUESTS</text><rect x="374" y="718" width="255" height="48" rx="24" fill="${accent2}" opacity=".15"/><text x="405" y="749" fill="${accent2}">PROVENANCE LINKED</text><rect x="649" y="718" width="258" height="48" rx="24" fill="${accent}" opacity=".15"/><text x="681" y="749" fill="${accent}">REVIEW REQUIRED</text></g>
  <text x="1518" y="848" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="19" fill="#8297B8">ZININ DATA PRODUCTS · APIFY</text>
</svg>`;

const workflow = ({ title, market, accent, accent2, glow }) => {
    const steps = [
        ['1', 'RIGHTS', 'Buyer attests permitted use'],
        ['2', 'SCHEMA', 'Closed property record'],
        ['3', 'IDENTITY', 'Stable ID & dedupe'],
        ['4', 'EVIDENCE', 'Provenance & digests'],
        ['5', 'SETTLEMENT', 'Exact named +1'],
        ['6', 'REVIEW', 'Gaps & next action'],
    ];
    const cards = steps.map(([number, heading, detail], index) => {
        const x = 70 + index * 250;
        const color = index % 2 ? accent2 : accent;
        const arrow = index < steps.length - 1 ? `<path d="M${x + 205} 486 H${x + 242}" stroke="#5A7298" stroke-width="4"/><path d="M${x + 242} 486 l-14 -9 v18z" fill="#5A7298"/>` : '';
        return `<g><rect x="${x}" y="345" width="205" height="282" rx="26" fill="#12213A" stroke="${color}" stroke-width="2"/><circle cx="${x + 40}" cy="390" r="22" fill="${color}" opacity=".18"/><text x="${x + 40}" y="398" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="800" fill="${color}">${number}</text><text x="${x + 24}" y="454" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="750" fill="${color}">${heading}</text><text x="${x + 24}" y="510" font-family="Inter,Arial,sans-serif" font-size="22" fill="#EEF5FF">${escapeXml(detail.split(' ').slice(0, 3).join(' '))}</text><text x="${x + 24}" y="544" font-family="Inter,Arial,sans-serif" font-size="22" fill="#EEF5FF">${escapeXml(detail.split(' ').slice(3).join(' '))}</text>${arrow}</g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071426"/><stop offset="1" stop-color="#111C34"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation="50"/></filter></defs><rect width="1600" height="900" fill="url(#bg)"/><circle cx="1480" cy="80" r="250" fill="${glow}" opacity=".18" filter="url(#soft)"/><text x="72" y="88" font-family="Inter,Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="4" fill="${accent}">${escapeXml(market)}</text><text x="72" y="176" font-family="Inter,Arial,sans-serif" font-size="55" font-weight="760" fill="#FFFFFF">Evidence-to-action workflow</text><text x="74" y="234" font-family="Inter,Arial,sans-serif" font-size="28" fill="#B7C9E7">${escapeXml(title)}</text><text x="74" y="286" font-family="Inter,Arial,sans-serif" font-size="23" fill="#8399BA">No portal fetch · no identity inference · no automated property decision</text>${cards}<rect x="70" y="696" width="1460" height="84" rx="24" fill="#0F1E37" stroke="${accent}" stroke-width="1" opacity=".98"/><text x="104" y="748" font-family="Inter,Arial,sans-serif" font-size="24" fill="#EAF2FF">The Dataset carries settlement-neutral evidence. Current-run KVS OUTPUT carries authoritative delivery and charge reconciliation.</text><text x="1518" y="848" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="19" fill="#8297B8">ZININ DATA PRODUCTS · APIFY</text></svg>`;
};

for (const actor of actors) {
    const directory = path.join(process.cwd(), 'commercial115', actor.slug);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'readme-hero.svg'), `${hero(actor).trim()}\n`);
    fs.writeFileSync(path.join(directory, 'readme-workflow.svg'), `${workflow(actor).trim()}\n`);
}

console.log(JSON.stringify({ generated: actors.map((actor) => actor.slug), dimensions: '1600x900' }, null, 2));
