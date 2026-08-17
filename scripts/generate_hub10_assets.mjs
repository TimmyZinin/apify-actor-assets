import fs from 'node:fs';
import path from 'node:path';

// HUB-10 wave — 9 actors, 2 diagrams each (readme-hero, readme-workflow).
// Palette families (avoid navy-blue as the PRIMARY background — accents only):
//   YouTube hub (4 actors)   -> red/orange family
//   App store hub (2 actors) -> teal/cyan/green family
//   Adjacent networks (3)    -> violet/magenta family
// Background stays neutral dark charcoal across the whole wave (not blue).
//
// Card body lines are budgeted to ~27 characters (Helvetica @ font-size 27 in a
// 440px card, ~384px of usable text width) so nothing overflows into the next
// card. Arrows use ASCII "->" — the Unicode "→" glyph renders as tofu boxes
// under the cairosvg/Helvetica fallback used for WebP conversion.

const BG = '#101216';
const CARD_BG = '#1a1e25';
const CARD_BORDER = '#2a2f38';
const TEXT_MAIN = '#f2f4f7';
const TEXT_SUB = '#98a1ad';
const OWNER_LINE = 'apify.com/zinin · pay per verified result · robots.txt honoured on every host';

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[character]));

const actors = [
    // ---------- YouTube hub (red/orange family) ----------
    {
        slug: 'youtube-channel-intel',
        accent: '#FF4757',
        accent2: '#FFA502',
        hero: {
            title: 'YouTube Channel Intel',
            subtitle: 'Public About-page data in — subscribers, business email, links out',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 100 handles/URLs', 'no login, no API key', 'no CAPTCHA solving'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['/about page, one GET', 'email scan in bio text', 'links decoded, not guessed'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['subscribers + description', 'business email if public', 'or an honest not-found row'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Cold-outreach list building — every row is a real public channel',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'CRM export of handles', 'n8n / Make lead-gen step'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['GET /about, zero JS', 'regex scan for email', 'charge only on found'] },
                { tag: 'CRM', heading: 'Enrich & queue', lines: ['channel -> lead record', 'email -> outreach queue', 'no email, still usable'] },
            ],
        },
    },
    {
        slug: 'youtube-channel-videos-list',
        accent: '#FF6348',
        accent2: '#FFAF40',
        hero: {
            title: 'YouTube Channel Videos List',
            subtitle: 'Channel in — up to 100 recent uploads with titles, views, age',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 50 channels', 'handle, URL, or ID', 'actor builds the list'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['uploads playlist page', 'up to 100 videos', 'age text for first 30'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['videoId + title + views', 'publish age, top 30', 'one row per video'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Content-cadence monitoring — what a channel just posted',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'content-monitoring tool', 'competitor watch-list'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['resolve channel -> UU id', 'fetch up to 100 rows', 'match title/age by id'] },
                { tag: 'FEED', heading: 'Digest & alert', lines: ['video -> digest sheet', 'new upload -> alert', 'partial rows flagged'] },
            ],
        },
    },
    {
        slug: 'youtube-channel-lookalike-finder',
        accent: '#FF3860',
        accent2: '#FF7F50',
        hero: {
            title: 'YouTube Channel Lookalike Finder',
            subtitle: 'One channel in — the similar channels YouTube itself recommends',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 50 channels', 'no login, no API key', 'no keyword discovery'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['/about, similar widget', 'channelId + name + subs', 'widget size varies'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['one row per similar', 'channel, subs if known', 'never the source itself'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Lookalike-audience building for influencer and competitor lists',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'competitor watch-list', 'influencer research tool'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['fetch /about widget', 'extract similar list', 'exclude source channel'] },
                { tag: 'CRM', heading: 'Build & target', lines: ['channel -> lookalike list', 'list -> outreach batch', 'feeds media planning'] },
            ],
        },
    },
    {
        slug: 'youtube-playlist-scraper',
        accent: '#E8433A',
        accent2: '#FFB347',
        hero: {
            title: 'YouTube Playlist Scraper',
            subtitle: 'Any playlist ID in — its full video composition out',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['any list= id or URL', 'your own or another’s', 'no channel resolving'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['/playlist page, one GET', 'up to 100 videos', 'position, title, views'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['ordered video rows', 'honest empty if dead', 'flag at 100-item cap'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Playlist and course-catalog analytics for any public list=',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'catalog aggregator', 'content-research tool'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['GET /playlist?list=', '404 vs empty, apart', 'no channel logic'] },
                { tag: 'FEED', heading: 'Catalog & digest', lines: ['playlist -> catalog', 'composition -> digest', 'topic research sheet'] },
            ],
        },
    },

    // ---------- App-store hub (teal/cyan family, sold as a pair) ----------
    {
        slug: 'googleplay-app-intel',
        accent: '#2ECC71',
        accent2: '#17C3B2',
        hero: {
            title: 'Google Play App Intel',
            subtitle: 'Package ID in — rating, version, install range out',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 100 package IDs', 'e.g. com.whatsapp', 'no Google API key'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['ld+json app block', 'version, update date', 'downloads, age rating'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['rating + category', 'version + updated date', 'install range, ratings'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Competitor app-card monitoring — no reviews, no keyword search',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'competitor watch-list', 'BD / release tracker'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['GET /store/apps/details', 'ld+json + HTML fields', 'decision envelope'] },
                { tag: 'ALERT', heading: 'Track & alert', lines: ['app -> dashboard row', 'version bump -> alert', 'rating drop -> Slack'] },
            ],
        },
    },
    {
        slug: 'appstore-app-intel',
        accent: '#17A2B8',
        accent2: '#4FD8C4',
        hero: {
            title: 'App Store App Intel',
            subtitle: 'App ID in — rating, review count, What’s New out',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 100 numeric IDs', 'or App Store URLs', 'no developer key'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['app block by @type', 'not by page position', 'seller, size, IAP text'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['rating + review count', 'price, publisher', 'release notes text'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Paired with Google Play App Intel — one price, one schema',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'competitor watch-list', 'release tracker'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['GET the app card', 'pick block by @type', 'HTML fallback fields'] },
                { tag: 'ALERT', heading: 'Track & alert', lines: ['app -> BD sheet row', 'notes -> change alert', 'price shift -> notice'] },
            ],
        },
    },

    // ---------- Adjacent-networks hub (violet/magenta family) ----------
    {
        slug: 'substack-publication-scraper',
        accent: '#A66CFF',
        accent2: '#FF6EC7',
        hero: {
            title: 'Substack Publication Scraper',
            subtitle: 'Publication domain in — posts out, paywall status honestly flagged',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 20 publications', 'own domain or substack', 'no login, no API key'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['official posts API', 'robots checked live', 'audience field as-is'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['title, date, full body', 'everyone vs only_paid', 'paid posts flagged'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'Newsletter competitive monitoring — paywall never bypassed',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'newsletter watch-list', 'content monitoring'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['check domain robots', 'GET posts per pub', 'blocked domains free'] },
                { tag: 'FEED', heading: 'Digest & flag', lines: ['post -> digest feed', 'paid -> metadata only', 'free -> full body'] },
            ],
        },
    },
    {
        slug: 'bluesky-profile-scraper',
        accent: '#8C7DFB',
        accent2: '#5FA8FF',
        hero: {
            title: 'Bluesky Profile Scraper',
            subtitle: 'Handles or DIDs in — public profiles out, batched in one call',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 100 handles/DIDs', 'DID is more stable', 'no login, no token'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['getProfiles batch call', 'diffs list vs response', 'no silent drops'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['followers, bio, posts', 'verified status if set', 'honest not_found rows'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'CRM social-profile enrichment — one batched, keyless call',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'CRM export of handles', 'n8n / Make step'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['one getProfiles batch', 'diff request vs reply', 'backoff on 429'] },
                { tag: 'CRM', heading: 'Enrich & queue', lines: ['profile -> CRM field', 'score from followers', 'not_found, unbilled'] },
            ],
        },
    },
    {
        slug: 'spotify-artist-intel',
        accent: '#C147E9',
        accent2: '#7C4DFF',
        hero: {
            title: 'Spotify Artist Intel',
            subtitle: 'Artist, album or playlist URL in — the public card out',
            cards: [
                { tag: 'INPUT', heading: 'You submit', lines: ['up to 50 Spotify URLs', 'artist, album, playlist', 'no login, no API key'] },
                { tag: 'EVIDENCE', heading: 'The Actor reads', lines: ['server-rendered card', 'bare UA, never browser', 'artist/album schema'] },
                { tag: 'OUTPUT', heading: 'You receive', lines: ['monthly listeners', 'track count + year', 'playlist items + saves'] },
            ],
        },
        workflow: {
            heading: 'Where it sits in your pipeline',
            subheading: 'A&R and release monitoring — keyless card snapshots',
            stages: [
                { tag: 'START', heading: 'Trigger', lines: ['schedule / Apify API', 'A&R watch-list', 'release tracker'] },
                { tag: 'RUN', heading: 'Actor run', lines: ['GET with bare UA', 'parse by object type', 'honest 404 if unknown'] },
                { tag: 'ALERT', heading: 'Track & alert', lines: ['artist -> dashboard', 'listener shift -> alert', 'new release -> notice'] },
            ],
        },
    },
];

const heroSvg = (actor) => {
    const { title, subtitle, cards } = actor.hero;
    const cardX = [60, 580, 1100];
    const arrowX = [508, 1028];
    const pillWidth = { INPUT: 105, EVIDENCE: 150, OUTPUT: 120 };

    const cardBlocks = cards.map((card, index) => {
        const x = cardX[index];
        const pillW = pillWidth[card.tag] || 120;
        const lines = card.lines.map((line, lineIndex) => `<text x="${x + 36}" y="${424 + lineIndex * 42}" font-family="Helvetica" font-size="27" fill="${TEXT_SUB}">${escapeXml(line)}</text>`).join('');
        return `<rect x="${x}" y="300" width="440" height="340" rx="18" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2"/>
<rect x="${x}" y="300" width="8" height="340" rx="4" fill="${actor.accent}"/>
<text x="${x + 36}" y="362" font-family="Helvetica" font-size="34" font-weight="bold" fill="${TEXT_MAIN}">${escapeXml(card.heading)}</text>
${lines}
<rect x="${x + 307}" y="572" width="${pillW}" height="44" rx="22" fill="${actor.accent}"/>
<text x="${x + 307 + pillW / 2}" y="601" font-family="Helvetica" font-size="24" font-weight="bold" fill="${BG}" text-anchor="middle">${escapeXml(card.tag)}</text>`;
    }).join('\n');

    const arrows = arrowX.map((x) => `<line x1="${x}" y1="470.0" x2="${x + 38}" y2="470.0" stroke="${actor.accent}" stroke-width="5"/><path d="M ${x + 38} 456.0 L ${x + 64} 470.0 L ${x + 38} 484.0 Z" fill="${actor.accent}"/>`).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<rect width="1600" height="900" fill="${BG}"/>
<rect x="0" y="0" width="1600" height="6" fill="${actor.accent}"/>
<text x="80" y="118" font-family="Helvetica" font-size="54" font-weight="bold" fill="${TEXT_MAIN}">${escapeXml(title)}</text>
<text x="80" y="172" font-family="Helvetica" font-size="30" fill="${TEXT_SUB}">${escapeXml(subtitle)}</text>
${cardBlocks}
${arrows}
<text x="80" y="852" font-family="Helvetica" font-size="24" fill="${TEXT_SUB}">${escapeXml(OWNER_LINE)}</text>
</svg>
`;
};

const workflowSvg = (actor) => {
    const { heading, subheading, stages } = actor.workflow;
    const cardX = [60, 580, 1100];
    const arrowX = [508, 1028];
    const pillWidth = { START: 105, RUN: 75, CRM: 75, FEED: 90, ALERT: 95 };

    const cardBlocks = stages.map((stage, index) => {
        const x = cardX[index];
        const pillW = pillWidth[stage.tag] || 90;
        const lines = stage.lines.map((line, lineIndex) => `<text x="${x + 36}" y="${424 + lineIndex * 42}" font-family="Helvetica" font-size="27" fill="${TEXT_SUB}">${escapeXml(line)}</text>`).join('');
        return `<rect x="${x}" y="300" width="440" height="340" rx="18" fill="${CARD_BG}" stroke="${CARD_BORDER}" stroke-width="2"/>
<rect x="${x}" y="300" width="8" height="340" rx="4" fill="${actor.accent}"/>
<text x="${x + 36}" y="362" font-family="Helvetica" font-size="34" font-weight="bold" fill="${TEXT_MAIN}">${escapeXml(stage.heading)}</text>
${lines}
<rect x="${x + 337}" y="572" width="${pillW}" height="44" rx="22" fill="${actor.accent}"/>
<text x="${x + 337 + pillW / 2}" y="601" font-family="Helvetica" font-size="24" font-weight="bold" fill="${BG}" text-anchor="middle">${escapeXml(stage.tag)}</text>`;
    }).join('\n');

    const arrows = arrowX.map((x) => `<line x1="${x}" y1="470.0" x2="${x + 38}" y2="470.0" stroke="${actor.accent}" stroke-width="5"/><path d="M ${x + 38} 456.0 L ${x + 64} 470.0 L ${x + 38} 484.0 Z" fill="${actor.accent}"/>`).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<rect width="1600" height="900" fill="${BG}"/>
<rect x="0" y="0" width="1600" height="6" fill="${actor.accent}"/>
<text x="80" y="118" font-family="Helvetica" font-size="54" font-weight="bold" fill="${TEXT_MAIN}">${escapeXml(heading)}</text>
<text x="80" y="172" font-family="Helvetica" font-size="30" fill="${TEXT_SUB}">${escapeXml(subheading)}</text>
${cardBlocks}
${arrows}
<text x="80" y="852" font-family="Helvetica" font-size="24" fill="${TEXT_SUB}">${escapeXml(OWNER_LINE)}</text>
</svg>
`;
};

const outDir = path.join(process.env.HOME, 'apify-actor-assets', 'hub10');
fs.mkdirSync(outDir, { recursive: true });

for (const actor of actors) {
    fs.writeFileSync(path.join(outDir, `${actor.slug}--readme-hero.svg`), heroSvg(actor));
    fs.writeFileSync(path.join(outDir, `${actor.slug}--readme-workflow.svg`), workflowSvg(actor));
}

console.log(JSON.stringify({ generated: actors.map((a) => a.slug), count: actors.length * 2, dimensions: '1600x900', outDir }, null, 2));
